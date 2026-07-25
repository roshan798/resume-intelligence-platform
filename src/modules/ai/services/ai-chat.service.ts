import { AIChatRole, AIProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { AIGatewayService } from "./ai-gateway.service";

const memoryMessageLimit = 20;
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

    async list(userId: string) {
        await this.assertAccess(userId);
        return prisma.aIChatConversation.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            take: 30,
            select: {
                id: true,
                title: true,
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
                messages: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        role: true,
                        content: true,
                        createdAt: true,
                    },
                },
            },
        });
        return conversation;
    }

    async send(userId: string, input: { conversationId?: string | null; message: string }) {
        await this.assertAccess(userId);
        const conversation = input.conversationId
            ? await prisma.aIChatConversation.findFirst({
                  where: { id: input.conversationId, userId },
                  select: { id: true, title: true },
              })
            : await prisma.aIChatConversation.create({
                  data: {
                      userId,
                      title: titleFrom(input.message),
                  },
                  select: { id: true, title: true },
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

        const recent = await prisma.aIChatMessage.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: "desc" },
            take: memoryMessageLimit,
            select: { role: true, content: true },
        });
        recent.reverse();

        try {
            const response = await this.gateway.generate({
                operation: "ai-chat",
                userId,
                systemPrompt,
                prompt: recent
                    .map((message) => `${message.role === AIChatRole.USER ? "User" : "Assistant"}: ${message.content}`)
                    .join("\n\n"),
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
                select: { id: true, role: true, content: true, createdAt: true },
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
        input: { conversationId?: string | null; message: string },
    ) {
        await this.assertAccess(userId);
        const isNew = !input.conversationId;
        const conversation = input.conversationId
            ? await prisma.aIChatConversation.findFirst({
                  where: { id: input.conversationId, userId },
                  select: { id: true, title: true },
              })
            : await prisma.aIChatConversation.create({
                  data: { userId, title: titleFrom(input.message) },
                  select: { id: true, title: true },
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
        yield { type: "start" as const, conversation, userMessage };

        const recent = await prisma.aIChatMessage.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: "desc" },
            take: memoryMessageLimit,
            select: { role: true, content: true },
        });
        recent.reverse();
        let content = "";

        try {
            let generation:
                | { provider: string; model: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }
                | undefined;
            for await (const event of this.gateway.stream({
                operation: "ai-chat",
                userId,
                systemPrompt,
                prompt: recent
                    .map((item) => `${item.role === AIChatRole.USER ? "User" : "Assistant"}: ${item.content}`)
                    .join("\n\n"),
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
                select: { id: true, role: true, content: true, createdAt: true },
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

    private async assertAccess(userId: string) {
        if (!(await this.access(userId))) {
            throw new AIChatAccessError("AI chat is not enabled for this account.");
        }
    }
}

function titleFrom(message: string) {
    const title = message.replace(/\s+/gu, " ").trim();
    return title.length > 60 ? `${title.slice(0, 57)}…` : title;
}
