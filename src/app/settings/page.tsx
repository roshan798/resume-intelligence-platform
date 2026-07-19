import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AISettingsForm } from "@/components/settings/ai-settings-form";
import { AISettingsService } from "@/modules/ai/services/ai-settings.service";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");
    const settings = await new AISettingsService().get(session.user.id);
    return <main className="container mx-auto max-w-5xl space-y-8 px-4 py-8"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Configuration</p><h1 className="mt-2 text-4xl font-bold">AI settings</h1><p className="mt-2 text-muted-foreground">Control provider routing, feature models, and safeguards for your account.</p></div><AISettingsForm initial={settings} /></main>;
}
