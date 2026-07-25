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

    const [conversations, contextOptions] = await Promise.all([
        service.list(session.user.id),
        service.contextOptions(session.user.id),
    ]);
    const active = conversations[0]
        ? await service.messages(session.user.id, conversations[0].id)
        : null;

    return (
        <main className="app-page">
            <div>
                <p className="page-eyebrow">
                    Private beta
                </p>
                <h1 className="page-title">AI career chat</h1>
                <p className="page-description">
                    Persistent, account-private conversations powered by your configured AI provider.
                </p>
            </div>
            <AIChat
                initialConversations={conversations.map((conversation) => ({
                    id: conversation.id,
                    title: conversation.title,
                    updatedAt: conversation.updatedAt.toISOString(),
                    messageCount: conversation._count.messages,
                    responseStyle: conversation.responseStyle,
                    resumeVersionId: conversation.resumeVersionId,
                    jdAnalysisId: conversation.jdAnalysisId,
                }))}
                initialConversationId={active?.id ?? null}
                initialSummary={active?.summary ?? null}
                initialResponseStyle={active?.responseStyle ?? "BALANCED"}
                initialDocumentContext={{
                    resumeVersionId: active?.resumeVersionId ?? null,
                    jdAnalysisId: active?.jdAnalysisId ?? null,
                }}
                resumeOptions={contextOptions.resumeVersions.map((version) => ({
                    id: version.id,
                    label: `${version.resume.title} · Version ${version.versionNumber} · ${version.status}`,
                }))}
                jdOptions={contextOptions.jdAnalyses.map((jd) => ({
                    id: jd.id,
                    label: `${jd.roleTitle || "Untitled role"}${jd.company ? ` at ${jd.company}` : ""} · Snapshot ${jd.snapshotNumber}`,
                }))}
                initialContext={{
                    totalMessages: active?._count.messages ?? 0,
                    activeMessages: Math.min(active?._count.messages ?? 0, 20),
                    summarizedMessages: active?.summarizedMessageCount ?? 0,
                    limit: 20,
                }}
                initialMessages={(active?.messages ?? []).map((message) => ({
                    ...message,
                    createdAt: message.createdAt.toISOString(),
                }))}
            />
        </main>
    );
}
