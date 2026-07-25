import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { auth } from "@/auth";
import { AIChat } from "@/components/ai/ai-chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIChatService } from "@/modules/ai/services/ai-chat.service";

export const metadata: Metadata = {
    title: "AI Chat",
    robots: { index: false, follow: false },
};

export default async function AIChatPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const service = new AIChatService();
    if (!(await service.access(session.user.id))) {
        return (
            <main className="container mx-auto max-w-3xl px-4 py-12">
                <Card>
                    <CardHeader>
                        <LockKeyhole className="mb-3 size-8 text-muted-foreground" />
                        <CardTitle>AI chat access is restricted</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        This feature has not been enabled for your account.
                    </CardContent>
                </Card>
            </main>
        );
    }

    const conversations = await service.list(session.user.id);
    const active = conversations[0]
        ? await service.messages(session.user.id, conversations[0].id)
        : null;

    return (
        <main className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Private beta
                </p>
                <h1 className="mt-2 text-4xl font-bold">AI career chat</h1>
                <p className="mt-2 text-muted-foreground">
                    Persistent, account-private conversations powered by your configured AI provider.
                </p>
            </div>
            <AIChat
                initialConversations={conversations.map((conversation) => ({
                    id: conversation.id,
                    title: conversation.title,
                    updatedAt: conversation.updatedAt.toISOString(),
                    messageCount: conversation._count.messages,
                }))}
                initialConversationId={active?.id ?? null}
                initialMessages={(active?.messages ?? []).map((message) => ({
                    ...message,
                    createdAt: message.createdAt.toISOString(),
                }))}
            />
        </main>
    );
}
