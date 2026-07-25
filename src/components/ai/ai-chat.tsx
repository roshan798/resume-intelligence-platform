"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Check, Copy, Menu, MessageSquarePlus, Pencil, Search, Send, Trash2, UserRound, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatMarkdown } from "./chat-markdown";

interface Conversation {
    id: string;
    title: string;
    updatedAt: string;
    messageCount: number;
    responseStyle: ResponseStyle;
    resumeVersionId: string | null;
    jdAnalysisId: string | null;
}

type ResponseStyle = "CONCISE" | "BALANCED" | "DETAILED" | "COACHING";

interface DocumentContext {
    resumeVersionId: string | null;
    jdAnalysisId: string | null;
}

interface ContextOption {
    id: string;
    label: string;
}

interface ChatMessage {
    id: string;
    role: "USER" | "ASSISTANT";
    content: string;
    provider?: string | null;
    modelUsed?: string | null;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    createdAt: string;
}

interface ContextUsage {
    totalMessages: number;
    activeMessages: number;
    summarizedMessages: number;
    limit: number;
}

export function AIChat({
    initialConversations,
    initialConversationId,
    initialSummary,
    initialResponseStyle,
    initialDocumentContext,
    resumeOptions,
    jdOptions,
    initialContext,
    initialMessages,
}: {
    initialConversations: Conversation[];
    initialConversationId: string | null;
    initialSummary: string | null;
    initialResponseStyle: ResponseStyle;
    initialDocumentContext: DocumentContext;
    resumeOptions: ContextOption[];
    jdOptions: ContextOption[];
    initialContext: ContextUsage;
    initialMessages: ChatMessage[];
}) {
    const [conversations, setConversations] = useState(initialConversations);
    const [conversationId, setConversationId] = useState(initialConversationId);
    const [messages, setMessages] = useState(initialMessages);
    const [summary, setSummary] = useState(initialSummary);
    const [responseStyle, setResponseStyle] = useState<ResponseStyle>(initialResponseStyle);
    const [documentContext, setDocumentContext] = useState(initialDocumentContext);
    const [contextUsage, setContextUsage] = useState(initialContext);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [searching, setSearching] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [loadingConversation, setLoadingConversation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [failedMessage, setFailedMessage] = useState<string | null>(null);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const autoFollowRef = useRef(true);
    const scrollFrameRef = useRef<number | null>(null);
    const conversationTokens = messages.reduce(
        (total, item) => total + (item.totalTokens ?? 0),
        0,
    );

    useEffect(() => {
        const viewport = endRef.current?.closest<HTMLElement>(
            '[data-slot="scroll-area-viewport"]',
        );
        if (!viewport) return;
        const trackPosition = () => {
            const distanceFromBottom =
                viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
            autoFollowRef.current = distanceFromBottom < 96;
        };
        viewport.addEventListener("scroll", trackPosition, { passive: true });
        return () => viewport.removeEventListener("scroll", trackPosition);
    }, []);

    useEffect(() => {
        if (!autoFollowRef.current) return;
        if (scrollFrameRef.current !== null) {
            window.cancelAnimationFrame(scrollFrameRef.current);
        }
        scrollFrameRef.current = window.requestAnimationFrame(() => {
            endRef.current?.scrollIntoView({
                block: "end",
                behavior: pending ? "auto" : "smooth",
            });
            scrollFrameRef.current = null;
        });
        return () => {
            if (scrollFrameRef.current !== null) {
                window.cancelAnimationFrame(scrollFrameRef.current);
                scrollFrameRef.current = null;
            }
        };
    }, [messages, pending]);

    useEffect(() => {
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setSearching(true);
            try {
                const response = await fetch(
                    `/api/ai/chat${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`,
                    { signal: controller.signal },
                );
                const body = await response.json() as {
                    message?: string;
                    conversations?: Array<Conversation & { _count: { messages: number } }>;
                };
                if (!response.ok || !body.conversations) {
                    throw new Error(body.message ?? "Unable to search conversations.");
                }
                setConversations(body.conversations.map((item) => ({
                    id: item.id,
                    title: item.title,
                    updatedAt: item.updatedAt,
                    messageCount: item._count.messages,
                    responseStyle: item.responseStyle,
                    resumeVersionId: item.resumeVersionId,
                    jdAnalysisId: item.jdAnalysisId,
                })));
            } catch (caught) {
                if (!(caught instanceof DOMException && caught.name === "AbortError")) {
                    setError(caught instanceof Error ? caught.message : "Unable to search conversations.");
                }
            } finally {
                if (!controller.signal.aborted) setSearching(false);
            }
        }, 300);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [search]);

    async function selectConversation(id: string) {
        if (id === conversationId || loadingConversation) return;
        setLoadingConversation(true);
        autoFollowRef.current = true;
        setError(null);
        try {
            const response = await fetch(`/api/ai/chat/${id}`);
            const body = await response.json() as {
                message?: string;
                conversation?: {
                    messages: ChatMessage[];
                    summary: string | null;
                    summarizedMessageCount: number;
                    _count: { messages: number };
                    responseStyle: ResponseStyle;
                    resumeVersionId: string | null;
                    jdAnalysisId: string | null;
                };
            };
            if (!response.ok || !body.conversation) {
                throw new Error(body.message ?? "Unable to load conversation.");
            }
            setConversationId(id);
            setMessages(body.conversation.messages);
            setSummary(body.conversation.summary);
            setResponseStyle(body.conversation.responseStyle);
            setDocumentContext({
                resumeVersionId: body.conversation.resumeVersionId,
                jdAnalysisId: body.conversation.jdAnalysisId,
            });
            setSidebarOpen(false);
            setContextUsage({
                totalMessages: body.conversation._count.messages,
                activeMessages: Math.min(body.conversation._count.messages, 20),
                summarizedMessages: body.conversation.summarizedMessageCount,
                limit: 20,
            });
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
        autoFollowRef.current = true;

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
        setFailedMessage(null);
        const originalConversationId = conversationId;
        const contextBeforeSend = contextUsage;
        const summaryBeforeSend = summary;
        let persistedUserId: string | null = null;

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId,
                    message: content,
                    responseStyle,
                    ...documentContext,
                }),
            });
            if (!response.ok || !response.body) {
                const body = await response.json().catch(() => null) as { message?: string } | null;
                throw new Error(body?.message ?? "Unable to send message.");
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let streamedConversation: {
                id: string;
                title: string;
                responseStyle: ResponseStyle;
                resumeVersionId: string | null;
                jdAnalysisId: string | null;
            } | null = null;
            let persistedUser: ChatMessage | null = null;

            while (true) {
                const { value, done } = await reader.read();
                buffer += decoder.decode(value, { stream: !done });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                    if (!line.trim()) continue;
                    const event = JSON.parse(line) as
                        | {
                            type: "start";
                            conversation: {
                                id: string;
                                title: string;
                                summary: string | null;
                                responseStyle: ResponseStyle;
                                resumeVersionId: string | null;
                                jdAnalysisId: string | null;
                            };
                            context: ContextUsage;
                            userMessage: ChatMessage;
                        }
                        | { type: "delta"; text: string }
                        | { type: "done"; assistantMessage: ChatMessage }
                        | { type: "error"; message: string };
                    if (event.type === "start") {
                        streamedConversation = event.conversation;
                        persistedUser = event.userMessage;
                        persistedUserId = event.userMessage.id;
                        setConversationId(event.conversation.id);
                        setSummary(event.conversation.summary);
                        setResponseStyle(event.conversation.responseStyle);
                        setDocumentContext({
                            resumeVersionId: event.conversation.resumeVersionId,
                            jdAnalysisId: event.conversation.jdAnalysisId,
                        });
                        setContextUsage(event.context);
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
                        setContextUsage((current) => ({
                            ...current,
                            totalMessages: current.totalMessages + 1,
                            activeMessages: Math.min(current.totalMessages + 1, current.limit),
                        }));
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
                    responseStyle: completedConversation.responseStyle,
                    resumeVersionId: completedConversation.resumeVersionId,
                    jdAnalysisId: completedConversation.jdAnalysisId,
                };
                return [updated, ...current.filter((item) => item.id !== completedConversation.id)];
            });
        } catch (caught) {
            setMessages((current) => current.filter(
                (item) =>
                    item.id !== optimistic.id &&
                    item.id !== streamingId &&
                    item.id !== persistedUserId,
            ));
            setError(caught instanceof Error ? caught.message : "Unable to send message.");
            setMessage(content);
            setFailedMessage(content);
            if (!originalConversationId) {
                setConversationId(null);
                setSummary(null);
                setResponseStyle(responseStyle);
                setDocumentContext(documentContext);
                setContextUsage({ totalMessages: 0, activeMessages: 0, summarizedMessages: 0, limit: 20 });
            } else {
                setSummary(summaryBeforeSend);
                setContextUsage(contextBeforeSend);
            }
        } finally {
            setPending(false);
        }
    }

    function retryFailedMessage() {
        if (!failedMessage || pending) return;
        setMessage(failedMessage);
        setFailedMessage(null);
        setError(null);
        window.requestAnimationFrame(() => formRef.current?.requestSubmit());
    }

    async function changeResponseStyle(nextStyle: ResponseStyle) {
        const previous = responseStyle;
        setResponseStyle(nextStyle);
        if (!conversationId) return;
        const response = await fetch(`/api/ai/chat/${conversationId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ responseStyle: nextStyle }),
        });
        const body = await response.json().catch(() => null) as { message?: string } | null;
        if (!response.ok) {
            setResponseStyle(previous);
            setError(body?.message ?? "Unable to update response style.");
            return;
        }
        setConversations((current) => current.map((item) =>
            item.id === conversationId ? { ...item, responseStyle: nextStyle } : item
        ));
    }

    async function changeDocumentContext(next: DocumentContext) {
        const previous = documentContext;
        setDocumentContext(next);
        if (!conversationId) return;
        const response = await fetch(`/api/ai/chat/${conversationId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
        });
        const body = await response.json().catch(() => null) as { message?: string } | null;
        if (!response.ok) {
            setDocumentContext(previous);
            setError(body?.message ?? "Unable to update attached context.");
            return;
        }
        setConversations((current) => current.map((item) =>
            item.id === conversationId
                ? { ...item, ...next }
                : item
        ));
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
            setSummary(null);
            setResponseStyle("BALANCED");
            setDocumentContext({ resumeVersionId: null, jdAnalysisId: null });
            setContextUsage({ totalMessages: 0, activeMessages: 0, summarizedMessages: 0, limit: 20 });
        }
    }

    async function renameConversation(conversation: Conversation) {
        const title = window.prompt("Rename conversation", conversation.title)?.trim();
        if (!title || title === conversation.title) return;
        const response = await fetch(`/api/ai/chat/${conversation.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        });
        const body = await response.json().catch(() => null) as {
            message?: string;
            title?: string;
        } | null;
        if (!response.ok || !body?.title) {
            setError(body?.message ?? "Unable to rename conversation.");
            return;
        }
        setConversations((current) => current.map((item) =>
            item.id === conversation.id ? { ...item, title: body.title! } : item
        ));
    }

    async function copyMessage(item: ChatMessage) {
        try {
            await navigator.clipboard.writeText(item.content);
            setCopiedMessageId(item.id);
            window.setTimeout(() => {
                setCopiedMessageId((current) => current === item.id ? null : current);
            }, 2_000);
        } catch {
            setError("Unable to copy this response. Check your browser clipboard permissions.");
        }
    }

    const conversationGroups = groupConversations(conversations);

    return (
        <div className="relative grid min-h-162.5 border bg-card lg:grid-cols-[280px_minmax(0,1fr)]">
            {sidebarOpen ? (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    aria-label="Close conversation sidebar"
                    onClick={() => setSidebarOpen(false)}
                />
            ) : null}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-[min(85vw,320px)] min-h-0 flex-col border-r bg-card shadow-xl transition-transform lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:shadow-none",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}>
                <div className="border-b p-4">
                    <div className="mb-3 flex items-center justify-between lg:hidden">
                        <span className="font-heading text-sm font-semibold uppercase tracking-wider">
                            Conversations
                        </span>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Close conversations"
                            onClick={() => setSidebarOpen(false)}>
                            <X aria-hidden="true" />
                        </Button>
                    </div>
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => {
                            autoFollowRef.current = true;
                            setConversationId(null);
                            setMessages([]);
                            setSummary(null);
                            setResponseStyle("BALANCED");
                            setDocumentContext({ resumeVersionId: null, jdAnalysisId: null });
                            setContextUsage({ totalMessages: 0, activeMessages: 0, summarizedMessages: 0, limit: 20 });
                            setError(null);
                            setSidebarOpen(false);
                        }}>
                        <MessageSquarePlus aria-hidden="true" />
                        New conversation
                    </Button>
                    <label className="relative mt-3 block">
                        <Search
                            aria-hidden="true"
                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search conversations"
                            aria-label="Search conversations"
                            className="h-9 w-full border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        />
                    </label>
                </div>
                <ScrollArea className="h-52 lg:h-147.5">
                    <div className="space-y-1 p-2">
                        {conversationGroups.map((group) => (
                            <section key={group.label} className="space-y-1">
                                <h3 className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    {group.label}
                                </h3>
                                {group.conversations.map((conversation) => (
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
                                            className="opacity-60 hover:opacity-100"
                                            aria-label={`Rename ${conversation.title}`}
                                            onClick={() => renameConversation(conversation)}>
                                            <Pencil aria-hidden="true" />
                                        </Button>
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
                            </section>
                        ))}
                        {conversations.length === 0 ? (
                            <p className="p-4 text-center text-sm text-muted-foreground">
                                {searching
                                    ? "Searching…"
                                    : search.trim()
                                      ? "No matching conversations."
                                      : "No conversations yet."}
                            </p>
                        ) : null}
                    </div>
                </ScrollArea>
            </aside>

            <section className="flex min-h-0 flex-col">
                <div className="flex items-center gap-3 border-b p-3 lg:hidden">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSidebarOpen(true)}>
                        <Menu aria-hidden="true" />
                        Conversations
                    </Button>
                    {conversationId ? (
                        <span className="truncate text-sm text-muted-foreground">
                            {conversations.find((item) => item.id === conversationId)?.title}
                        </span>
                    ) : null}
                </div>
                <ScrollArea className="h-130 flex-1">
                    <div className="mx-auto max-w-3xl space-y-6 p-5 md:p-8">
                        {contextUsage.totalMessages > 0 ? (
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                <span>
                                    {contextUsage.activeMessages} of {contextUsage.totalMessages} messages in active memory
                                </span>
                                {contextUsage.totalMessages > contextUsage.limit ? (
                                    <>
                                        <span aria-hidden="true">·</span>
                                        <span>
                                            {contextUsage.summarizedMessages} older messages summarized
                                        </span>
                                    </>
                                ) : null}
                                {conversationTokens > 0 ? (
                                    <>
                                        <span aria-hidden="true">·</span>
                                        <span>{conversationTokens.toLocaleString()} conversation tokens</span>
                                    </>
                                ) : null}
                            </div>
                        ) : null}
                        {summary ? (
                            <details className="border bg-muted/40 p-4 text-sm">
                                <summary className="cursor-pointer font-semibold">
                                    Earlier conversation summary
                                </summary>
                                <div className="mt-3 text-muted-foreground">
                                    <ChatMarkdown content={summary} />
                                </div>
                            </details>
                        ) : null}
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
                                <div className="max-w-[85%]">
                                    <div className={cn(
                                        "whitespace-pre-wrap border px-4 py-3 text-sm leading-6",
                                        item.role === "USER" ? "bg-foreground text-background" : "bg-background",
                                    )}>
                                        <ChatMarkdown
                                            content={item.content}
                                            inverse={item.role === "USER"}
                                        />
                                    </div>
                                    {item.role === "ASSISTANT" && item.content ? (
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="xs"
                                                onClick={() => copyMessage(item)}
                                                aria-label="Copy response">
                                                {copiedMessageId === item.id ? (
                                                    <>
                                                        <Check aria-hidden="true" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy aria-hidden="true" />
                                                        Copy
                                                    </>
                                                )}
                                            </Button>
                                            {item.provider || item.modelUsed ? (
                                                <span className="text-[11px] text-muted-foreground">
                                                    {[item.provider, item.modelUsed].filter(Boolean).join(" · ")}
                                                </span>
                                            ) : null}
                                            {(item.totalTokens ?? 0) > 0 ? (
                                                <span className="text-[11px] text-muted-foreground">
                                                    {item.totalTokens!.toLocaleString()} tokens
                                                    {typeof item.promptTokens === "number" &&
                                                    typeof item.completionTokens === "number"
                                                        ? ` (${item.promptTokens.toLocaleString()} in · ${item.completionTokens.toLocaleString()} out)`
                                                        : ""}
                                                </span>
                                            ) : null}
                                        </div>
                                    ) : null}
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

                <form ref={formRef} onSubmit={send} className="border-t p-4">
                    <div className="mx-auto mb-3 grid max-w-3xl gap-2 sm:grid-cols-2">
                        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Resume context
                            <select
                                value={documentContext.resumeVersionId ?? ""}
                                disabled={pending}
                                onChange={(event) => changeDocumentContext({
                                    ...documentContext,
                                    resumeVersionId: event.target.value || null,
                                })}
                                className="h-9 min-w-0 border bg-background px-2 text-xs font-medium normal-case tracking-normal text-foreground">
                                <option value="">No resume attached</option>
                                {resumeOptions.map((option) => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                        </label>
                        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Job description context
                            <select
                                value={documentContext.jdAnalysisId ?? ""}
                                disabled={pending}
                                onChange={(event) => changeDocumentContext({
                                    ...documentContext,
                                    jdAnalysisId: event.target.value || null,
                                })}
                                className="h-9 min-w-0 border bg-background px-2 text-xs font-medium normal-case tracking-normal text-foreground">
                                <option value="">No job description attached</option>
                                {jdOptions.map((option) => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="mx-auto flex max-w-3xl items-end gap-3">
                        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Style
                            <select
                                value={responseStyle}
                                disabled={pending}
                                onChange={(event) => changeResponseStyle(event.target.value as ResponseStyle)}
                                className="h-12 border bg-background px-2 text-xs font-medium normal-case tracking-normal text-foreground">
                                <option value="CONCISE">Concise</option>
                                <option value="BALANCED">Balanced</option>
                                <option value="DETAILED">Detailed</option>
                                <option value="COACHING">Coaching</option>
                            </select>
                        </label>
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
                    {error ? (
                        <div role="alert" className="mx-auto mt-2 flex max-w-3xl flex-wrap items-center gap-3 text-sm text-destructive">
                            <span>{error}</span>
                            {failedMessage ? (
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="outline"
                                    onClick={retryFailedMessage}>
                                    Retry
                                </Button>
                            ) : null}
                        </div>
                    ) : null}
                    <p className="mx-auto mt-2 max-w-3xl text-xs text-muted-foreground">
                        AI can make mistakes. Verify important career and application details.
                    </p>
                </form>
            </section>
        </div>
    );
}

function groupConversations(conversations: Conversation[]) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1_000;
    const startOfWeek = startOfToday - 7 * 24 * 60 * 60 * 1_000;
    const groups = [
        { label: "Today", conversations: [] as Conversation[] },
        { label: "Yesterday", conversations: [] as Conversation[] },
        { label: "Previous 7 days", conversations: [] as Conversation[] },
        { label: "Older", conversations: [] as Conversation[] },
    ];

    for (const conversation of conversations) {
        const timestamp = new Date(conversation.updatedAt).getTime();
        if (timestamp >= startOfToday) groups[0].conversations.push(conversation);
        else if (timestamp >= startOfYesterday) groups[1].conversations.push(conversation);
        else if (timestamp >= startOfWeek) groups[2].conversations.push(conversation);
        else groups[3].conversations.push(conversation);
    }
    return groups.filter((group) => group.conversations.length > 0);
}
