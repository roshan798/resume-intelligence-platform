"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, MessageSquarePlus, Send, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatMarkdown } from "./chat-markdown";

interface Conversation {
    id: string;
    title: string;
    updatedAt: string;
    messageCount: number;
}

interface ChatMessage {
    id: string;
    role: "USER" | "ASSISTANT";
    content: string;
    createdAt: string;
}

export function AIChat({
    initialConversations,
    initialConversationId,
    initialMessages,
}: {
    initialConversations: Conversation[];
    initialConversationId: string | null;
    initialMessages: ChatMessage[];
}) {
    const [conversations, setConversations] = useState(initialConversations);
    const [conversationId, setConversationId] = useState(initialConversationId);
    const [messages, setMessages] = useState(initialMessages);
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [loadingConversation, setLoadingConversation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, pending]);

    async function selectConversation(id: string) {
        if (id === conversationId || loadingConversation) return;
        setLoadingConversation(true);
        setError(null);
        try {
            const response = await fetch(`/api/ai/chat/${id}`);
            const body = await response.json() as {
                message?: string;
                conversation?: { messages: ChatMessage[] };
            };
            if (!response.ok || !body.conversation) {
                throw new Error(body.message ?? "Unable to load conversation.");
            }
            setConversationId(id);
            setMessages(body.conversation.messages);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Unable to load conversation.");
        } finally {
            setLoadingConversation(false);
        }
    }

    async function send(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const content = message.trim();
        if (!content || pending) return;

        const optimistic: ChatMessage = {
            id: `pending-${Date.now()}`,
            role: "USER",
            content,
            createdAt: new Date().toISOString(),
        };
        const streamingId = `streaming-${Date.now()}`;
        setMessages((current) => [
            ...current,
            optimistic,
            {
                id: streamingId,
                role: "ASSISTANT",
                content: "",
                createdAt: new Date().toISOString(),
            },
        ]);
        setMessage("");
        setPending(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId, message: content }),
            });
            if (!response.ok || !response.body) {
                const body = await response.json().catch(() => null) as { message?: string } | null;
                throw new Error(body?.message ?? "Unable to send message.");
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let streamedConversation: { id: string; title: string } | null = null;
            let persistedUser: ChatMessage | null = null;

            while (true) {
                const { value, done } = await reader.read();
                buffer += decoder.decode(value, { stream: !done });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                    if (!line.trim()) continue;
                    const event = JSON.parse(line) as
                        | { type: "start"; conversation: { id: string; title: string }; userMessage: ChatMessage }
                        | { type: "delta"; text: string }
                        | { type: "done"; assistantMessage: ChatMessage }
                        | { type: "error"; message: string };
                    if (event.type === "start") {
                        streamedConversation = event.conversation;
                        persistedUser = event.userMessage;
                        setConversationId(event.conversation.id);
                        setMessages((current) => current.map((item) =>
                            item.id === optimistic.id ? event.userMessage : item
                        ));
                    } else if (event.type === "delta") {
                        setMessages((current) => current.map((item) =>
                            item.id === streamingId
                                ? { ...item, content: `${item.content}${event.text}` }
                                : item
                        ));
                    } else if (event.type === "done") {
                        setMessages((current) => current.map((item) =>
                            item.id === streamingId ? event.assistantMessage : item
                        ));
                    } else {
                        throw new Error(event.message);
                    }
                }
                if (done) break;
            }
            if (!streamedConversation || !persistedUser) {
                throw new Error("The chat stream ended before the response was saved.");
            }
            const completedConversation = streamedConversation;
            setConversations((current) => {
                const existing = current.find((item) => item.id === completedConversation.id);
                const updated: Conversation = {
                    id: completedConversation.id,
                    title: completedConversation.title,
                    updatedAt: new Date().toISOString(),
                    messageCount: (existing?.messageCount ?? 0) + 2,
                };
                return [updated, ...current.filter((item) => item.id !== completedConversation.id)];
            });
        } catch (caught) {
            setMessages((current) => current.filter(
                (item) => item.id !== optimistic.id && item.id !== streamingId,
            ));
            setError(caught instanceof Error ? caught.message : "Unable to send message.");
            setMessage(content);
        } finally {
            setPending(false);
        }
    }

    async function removeConversation(id: string) {
        if (!window.confirm("Delete this conversation and its memory?")) return;
        const response = await fetch(`/api/ai/chat/${id}`, { method: "DELETE" });
        if (!response.ok) {
            const body = await response.json().catch(() => null) as { message?: string } | null;
            setError(body?.message ?? "Unable to delete conversation.");
            return;
        }
        const remaining = conversations.filter((item) => item.id !== id);
        setConversations(remaining);
        if (id === conversationId) {
            setConversationId(null);
            setMessages([]);
        }
    }

    return (
        <div className="grid min-h-[650px] border bg-card lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">
                <div className="border-b p-4">
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => {
                            setConversationId(null);
                            setMessages([]);
                            setError(null);
                        }}>
                        <MessageSquarePlus aria-hidden="true" />
                        New conversation
                    </Button>
                </div>
                <ScrollArea className="h-52 lg:h-[590px]">
                    <div className="space-y-1 p-2">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className={cn(
                                    "group flex items-center border",
                                    conversation.id === conversationId && "bg-muted",
                                )}>
                                <button
                                    type="button"
                                    className="min-w-0 flex-1 px-3 py-3 text-left"
                                    onClick={() => selectConversation(conversation.id)}>
                                    <span className="block truncate text-sm font-medium">{conversation.title}</span>
                                    <span className="mt-1 block text-xs text-muted-foreground">
                                        {conversation.messageCount} messages
                                    </span>
                                </button>
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    className="mr-2 opacity-60 hover:opacity-100"
                                    aria-label={`Delete ${conversation.title}`}
                                    onClick={() => removeConversation(conversation.id)}>
                                    <Trash2 aria-hidden="true" />
                                </Button>
                            </div>
                        ))}
                        {conversations.length === 0 ? (
                            <p className="p-4 text-center text-sm text-muted-foreground">No conversations yet.</p>
                        ) : null}
                    </div>
                </ScrollArea>
            </aside>

            <section className="flex min-h-0 flex-col">
                <ScrollArea className="h-[520px] flex-1">
                    <div className="mx-auto max-w-3xl space-y-6 p-5 md:p-8">
                        {messages.length === 0 ? (
                            <div className="py-20 text-center">
                                <Bot className="mx-auto size-10 text-muted-foreground" />
                                <h2 className="mt-4 font-heading text-xl font-semibold uppercase tracking-wider">
                                    Career assistant
                                </h2>
                                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                                    Ask about resumes, job descriptions, interviews, or application strategy.
                                    This conversation will be remembered.
                                </p>
                            </div>
                        ) : messages.map((item) => (
                            <article key={item.id} className={cn("flex gap-3", item.role === "USER" && "justify-end")}>
                                {item.role === "ASSISTANT" ? (
                                    <div className="flex size-8 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                                        <Bot aria-hidden="true" className="size-4" />
                                    </div>
                                ) : null}
                                <div className={cn(
                                    "max-w-[85%] whitespace-pre-wrap border px-4 py-3 text-sm leading-6",
                                    item.role === "USER" ? "bg-foreground text-background" : "bg-background",
                                )}>
                                    <ChatMarkdown
                                        content={item.content}
                                        inverse={item.role === "USER"}
                                    />
                                </div>
                                {item.role === "USER" ? (
                                    <div className="flex size-8 shrink-0 items-center justify-center border">
                                        <UserRound aria-hidden="true" className="size-4" />
                                    </div>
                                ) : null}
                            </article>
                        ))}
                        {pending ? (
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Bot className="size-5 animate-pulse" />
                                Thinking…
                            </div>
                        ) : null}
                        <div ref={endRef} />
                    </div>
                </ScrollArea>

                <form onSubmit={send} className="border-t p-4">
                    <div className="mx-auto flex max-w-3xl items-end gap-3">
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    event.currentTarget.form?.requestSubmit();
                                }
                            }}
                            rows={2}
                            maxLength={4_000}
                            disabled={pending}
                            placeholder="Ask your career assistant…"
                            className="min-h-12 flex-1 resize-none border bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        />
                        <Button type="submit" size="icon-lg" disabled={pending || !message.trim()} aria-label="Send message">
                            <Send aria-hidden="true" />
                        </Button>
                    </div>
                    {error ? <p role="alert" className="mx-auto mt-2 max-w-3xl text-sm text-destructive">{error}</p> : null}
                    <p className="mx-auto mt-2 max-w-3xl text-xs text-muted-foreground">
                        AI can make mistakes. Verify important career and application details.
                    </p>
                </form>
            </section>
        </div>
    );
}
