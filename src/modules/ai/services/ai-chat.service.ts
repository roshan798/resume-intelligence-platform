import { AIChatResponseStyle, AIChatRole, AIProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

import { AIGatewayService } from "./ai-gateway.service";

const memoryMessageLimit = 20;
const summaryRefreshInterval = 10;
const systemPrompt = `You are the private career assistant inside Resume Intelligence Platform.
Help with resumes, job descriptions, interview preparation, application strategy, and related career questions.
Use the conversation history as memory, but never claim to know facts the user has not provided.
Do not invent experience, qualifications, employers, metrics, or achievements.
Keep answers practical and concise. Clearly label assumptions and ask for missing facts when needed.`;

export class AIChatAccessError extends Error {}

export class AIChatService {
    private readonly gateway = new AIGatewayService();

    async access(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { aiChatEnabled: true },
        });
        return Boolean(user?.aiChatEnabled);
    }

    async list(userId: string, query?: string) {
        await this.assertAccess(userId);
        const search = query?.trim().slice(0, 100);
        return prisma.aIChatConversation.findMany({
            where: {
                userId,
                ...(search
                    ? {
                          OR: [
                              { title: { contains: search, mode: "insensitive" as const } },
                              {
                                  messages: {
                                      some: {
                                          content: {
                                              contains: search,
                                              mode: "insensitive" as const,
                                          },
                                      },
                                  },
                              },
                          ],
                      }
                    : {}),
            },
            orderBy: { updatedAt: "desc" },
            take: 30,
            select: {
                id: true,
                title: true,
                responseStyle: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { messages: true } },
            },
        });
    }

    async messages(userId: string, conversationId: string) {
        await this.assertAccess(userId);
        const conversation = await prisma.aIChatConversation.findFirst({
            where: { id: conversationId, userId },
            select: {
                id: true,
                title: true,
                summary: true,
                responseStyle: true,
                summarizedMessageCount: true,
                _count: { select: { messages: true } },
                messages: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        role: true,
                        content: true,
                        provider: true,
                        modelUsed: true,
                        promptTokens: true,
                        completionTokens: true,
                        totalTokens: true,
                        createdAt: true,
                    },
                },
            },
        });
        return conversation;
    }

    async send(userId: string, input: {
        conversationId?: string | null;
        message: string;
        responseStyle?: AIChatResponseStyle;
    }) {
        await this.assertAccess(userId);
        const conversation = input.conversationId
            ? await prisma.aIChatConversation.findFirst({
                  where: { id: input.conversationId, userId },
                  select: { id: true, title: true, responseStyle: true },
              })
            : await prisma.aIChatConversation.create({
                  data: {
                      userId,
                      title: titleFrom(input.message),
                      responseStyle: input.responseStyle ?? AIChatResponseStyle.BALANCED,
                  },
                  select: { id: true, title: true, responseStyle: true },
              });
        if (!conversation) throw new AIChatAccessError("Conversation not found.");

        const userMessage = await prisma.aIChatMessage.create({
            data: {
                conversationId: conversation.id,
                role: AIChatRole.USER,
                content: input.message,
            },
            select: { id: true, role: true, content: true, createdAt: true },
        });

        const memory = await this.memory(userId, conversation.id);

        try {
            const response = await this.gateway.generate({
                operation: "ai-chat",
                userId,
                systemPrompt: responseSystemPrompt(conversation.responseStyle),
                prompt: formatMemory(memory.summary, memory.recent),
                temperature: 0.35,
                maxTokens: 1_500,
            });
            const assistantMessage = await prisma.aIChatMessage.create({
                data: {
                    conversationId: conversation.id,
                    role: AIChatRole.ASSISTANT,
                    content: response.text.trim() || "I could not generate a response. Please try again.",
                    provider: response.provider === "GEMINI" ? AIProvider.GEMINI : AIProvider.GROQ,
                    modelUsed: response.model,
                    promptTokens: response.usage?.promptTokens ?? 0,
                    completionTokens: response.usage?.completionTokens ?? 0,
                    totalTokens: response.usage?.totalTokens ?? 0,
                },
                select: {
                    id: true,
                    role: true,
                    content: true,
                    provider: true,
                    modelUsed: true,
                    promptTokens: true,
                    completionTokens: true,
                    totalTokens: true,
                    createdAt: true,
                },
            });
            await prisma.aIChatConversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() },
            });
            return { conversation, userMessage, assistantMessage };
        } catch (error) {
            await prisma.aIChatMessage.delete({ where: { id: userMessage.id } });
            if (!input.conversationId) {
                await prisma.aIChatConversation.delete({ where: { id: conversation.id } });
            }
            throw error;
        }
    }

    async *sendStream(
        userId: string,
        input: {
            conversationId?: string | null;
            message: string;
            responseStyle?: AIChatResponseStyle;
        },
    ) {
        await this.assertAccess(userId);
        const isNew = !input.conversationId;
        const conversation = input.conversationId
            ? await prisma.aIChatConversation.findFirst({
                  where: { id: input.conversationId, userId },
                  select: { id: true, title: true, responseStyle: true },
              })
            : await prisma.aIChatConversation.create({
                  data: {
                      userId,
                      title: titleFrom(input.message),
                      responseStyle: input.responseStyle ?? AIChatResponseStyle.BALANCED,
                  },
                  select: { id: true, title: true, responseStyle: true },
              });
        if (!conversation) throw new AIChatAccessError("Conversation not found.");

        const userMessage = await prisma.aIChatMessage.create({
            data: {
                conversationId: conversation.id,
                role: AIChatRole.USER,
                content: input.message,
            },
            select: { id: true, role: true, content: true, createdAt: true },
        });
        const memory = await this.memory(userId, conversation.id);
        yield {
            type: "start" as const,
            conversation: { ...conversation, summary: memory.summary },
            context: {
                totalMessages: memory.totalMessages,
                activeMessages: Math.min(memory.totalMessages, memoryMessageLimit),
                summarizedMessages: memory.summarizedMessages,
                limit: memoryMessageLimit,
            },
            userMessage,
        };
        let content = "";

        try {
            let generation:
                | { provider: string; model: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }
                | undefined;
            for await (const event of this.gateway.stream({
                operation: "ai-chat",
                userId,
                systemPrompt: responseSystemPrompt(conversation.responseStyle),
                prompt: formatMemory(memory.summary, memory.recent),
                temperature: 0.35,
                maxTokens: 1_500,
            })) {
                if (event.type === "delta") {
                    content += event.text;
                    yield event;
                } else {
                    generation = event.response;
                }
            }
            if (!generation) throw new Error("The AI provider ended without generation metadata.");

            const assistantMessage = await prisma.aIChatMessage.create({
                data: {
                    conversationId: conversation.id,
                    role: AIChatRole.ASSISTANT,
                    content: content.trim() || "I could not generate a response. Please try again.",
                    provider: generation.provider === "GEMINI" ? AIProvider.GEMINI : AIProvider.GROQ,
                    modelUsed: generation.model,
                    promptTokens: generation.usage?.promptTokens ?? 0,
                    completionTokens: generation.usage?.completionTokens ?? 0,
                    totalTokens: generation.usage?.totalTokens ?? 0,
                },
                select: {
                    id: true,
                    role: true,
                    content: true,
                    provider: true,
                    modelUsed: true,
                    promptTokens: true,
                    completionTokens: true,
                    totalTokens: true,
                    createdAt: true,
                },
            });
            await prisma.aIChatConversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() },
            });
            yield { type: "done" as const, assistantMessage };
        } catch (error) {
            await prisma.aIChatMessage.delete({ where: { id: userMessage.id } }).catch(() => undefined);
            if (isNew) {
                await prisma.aIChatConversation.delete({ where: { id: conversation.id } }).catch(() => undefined);
            }
            throw error;
        }
    }

    async delete(userId: string, conversationId: string) {
        await this.assertAccess(userId);
        const result = await prisma.aIChatConversation.deleteMany({
            where: { id: conversationId, userId },
        });
        return result.count > 0;
    }

    async rename(userId: string, conversationId: string, title: string) {
        await this.assertAccess(userId);
        const result = await prisma.aIChatConversation.updateMany({
            where: { id: conversationId, userId },
            data: { title },
        });
        return result.count > 0;
    }

    async setResponseStyle(
        userId: string,
        conversationId: string,
        responseStyle: AIChatResponseStyle,
    ) {
        await this.assertAccess(userId);
        const result = await prisma.aIChatConversation.updateMany({
            where: { id: conversationId, userId },
            data: { responseStyle },
        });
        return result.count > 0;
    }

    private async assertAccess(userId: string) {
        if (!(await this.access(userId))) {
            throw new AIChatAccessError("AI chat is not enabled for this account.");
        }
    }

    private async memory(userId: string, conversationId: string) {
        const conversation = await prisma.aIChatConversation.findFirst({
            where: { id: conversationId, userId },
            select: {
                summary: true,
                summarizedMessageCount: true,
                _count: { select: { messages: true } },
            },
        });
        if (!conversation) throw new AIChatAccessError("Conversation not found.");

        const olderMessageCount = Math.max(0, conversation._count.messages - memoryMessageLimit);
        let summary = conversation.summary;
        let summarizedMessageCount = conversation.summarizedMessageCount;
        if (
            olderMessageCount > 0 &&
            olderMessageCount - conversation.summarizedMessageCount >= summaryRefreshInterval
        ) {
            const olderMessages = await prisma.aIChatMessage.findMany({
                where: { conversationId },
                orderBy: { createdAt: "asc" },
                take: olderMessageCount,
                select: { role: true, content: true },
            });
            try {
                const response = await this.gateway.generate({
                    operation: "ai-chat-summary",
                    userId,
                    systemPrompt:
                        "Summarize this conversation memory faithfully and concisely. Preserve user facts, preferences, decisions, unresolved questions, and important advice. Do not add facts.",
                    prompt: [
                        summary ? `Previous summary:\n${summary}` : "",
                        "Conversation messages:",
                        ...olderMessages.map((item) =>
                            `${item.role === AIChatRole.USER ? "User" : "Assistant"}: ${item.content}`
                        ),
                    ].filter(Boolean).join("\n\n"),
                    temperature: 0.1,
                    maxTokens: 500,
                });
                summary = response.text.trim();
                await prisma.aIChatConversation.update({
                    where: { id: conversationId },
                    data: {
                        summary,
                        summarizedMessageCount: olderMessageCount,
                    },
                });
                summarizedMessageCount = olderMessageCount;
            } catch (error) {
                logger.warn(
                    { err: error, userId, conversationId },
                    "AI chat memory summarization failed; using existing memory",
                );
            }
        }

        const recent = await prisma.aIChatMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: "desc" },
            take: memoryMessageLimit,
            select: { role: true, content: true },
        });
        recent.reverse();
        return {
            summary,
            recent,
            totalMessages: conversation._count.messages,
            summarizedMessages: Math.min(
                olderMessageCount,
                summarizedMessageCount,
            ),
        };
    }
}

function titleFrom(message: string) {
    const title = message.replace(/\s+/gu, " ").trim();
    return title.length > 60 ? `${title.slice(0, 57)}…` : title;
}

function formatMemory(
    summary: string | null,
    recent: Array<{ role: AIChatRole; content: string }>,
) {
    return [
        summary ? `Earlier conversation summary:\n${summary}` : "",
        "Recent conversation:",
        ...recent.map((item) =>
            `${item.role === AIChatRole.USER ? "User" : "Assistant"}: ${item.content}`
        ),
    ].filter(Boolean).join("\n\n");
}

function responseSystemPrompt(style: AIChatResponseStyle) {
    const styleInstruction: Record<AIChatResponseStyle, string> = {
        CONCISE: "Respond concisely. Prefer short paragraphs or bullets and include only essential details.",
        BALANCED: "Give a practical, moderately detailed answer with clear structure.",
        DETAILED: "Give a thorough answer with reasoning, examples, tradeoffs, and actionable next steps.",
        COACHING: "Use a supportive coaching style. Ask useful reflective questions and finish with concrete next actions.",
    };
    return `${systemPrompt}\n${styleInstruction[style]}`;
}
