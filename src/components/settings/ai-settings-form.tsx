"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

const features = [
    ["match-suggestions", "Match suggestions"],
    ["apply-latex-suggestion", "Apply LaTeX suggestions"],
    ["generate-summary", "Summary generation"],
    ["rewrite-bullets", "Bullet rewriting"],
    ["tailored-draft", "Tailored drafts"],
] as const;

interface Props {
    initial: {
        preferredProvider: "GEMINI" | "GROQ";
        fallbackEnabled: boolean;
        featureModels: Record<string, { provider: "GEMINI" | "GROQ"; model: string }>;
        monthlyTokenLimit: number | null;
        monthlyBudgetMicros: number | null;
        perRequestMaxTokens: number;
        configuredProviders: { GEMINI: boolean; GROQ: boolean };
        environmentModels: { GEMINI: string; GROQ: string };
    };
}

export function AISettingsForm({ initial }: Props) {
    const [settings, setSettings] = useState(initial);
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    function featureValue(operation: string) {
        return settings.featureModels[operation] ?? {
            provider: settings.preferredProvider,
            model: settings.environmentModels[settings.preferredProvider],
        };
    }

    async function save() {
        setPending(true); setMessage(null);
        const response = await fetch("/api/settings/ai", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                preferredProvider: settings.preferredProvider,
                fallbackEnabled: settings.fallbackEnabled,
                featureModels: settings.featureModels,
                monthlyTokenLimit: settings.monthlyTokenLimit,
                monthlyBudgetMicros: settings.monthlyBudgetMicros,
                perRequestMaxTokens: settings.perRequestMaxTokens,
            }),
        });
        const body = await response.json().catch(() => ({})) as { message?: string };
        setMessage(response.ok ? "AI settings saved." : body.message || "Unable to save settings.");
        setPending(false);
    }

    return (
        <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2">
                {(["GEMINI", "GROQ"] as const).map((provider) => (
                    <div key={provider} className="border bg-card p-5">
                        <div className="flex items-center justify-between"><h2 className="font-semibold">{provider === "GEMINI" ? "Google Gemini" : "Groq"}</h2><span className={settings.configuredProviders[provider] ? "text-xs text-emerald-600" : "text-xs text-destructive"}>{settings.configuredProviders[provider] ? "Configured" : "Missing API key"}</span></div>
                        <p className="mt-2 text-sm text-muted-foreground">Environment model: {settings.environmentModels[provider] || "Not configured"}</p>
                        <p className="mt-2 text-xs text-muted-foreground">API keys remain server-side environment secrets and are never returned to this page.</p>
                    </div>
                ))}
            </section>

            <section className="space-y-5 border bg-card p-6">
                <h2 className="text-xl font-semibold">Provider policy</h2>
                <label className="grid gap-2 text-sm">Preferred provider<select value={settings.preferredProvider} onChange={(event) => setSettings({ ...settings, preferredProvider: event.target.value as "GEMINI" | "GROQ" })} className="h-10 border bg-background px-3"><option value="GEMINI">Gemini</option><option value="GROQ">Groq</option></select></label>
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={settings.fallbackEnabled} onChange={(event) => setSettings({ ...settings, fallbackEnabled: event.target.checked })} />Fallback to the other provider when the preferred provider fails</label>
            </section>

            <section className="space-y-5 border bg-card p-6">
                <div><h2 className="text-xl font-semibold">Models by feature</h2><p className="text-sm text-muted-foreground">Leave a feature unchanged to use its selected provider and environment model.</p></div>
                <div className="space-y-4">
                    {features.map(([operation, label]) => {
                        const value = featureValue(operation);
                        return <div key={operation} className="grid gap-3 border-b pb-4 md:grid-cols-[1fr_180px_1fr] md:items-end"><p className="text-sm font-medium">{label}</p><label className="grid gap-1 text-xs">Provider<select value={value.provider} onChange={(event) => { const provider = event.target.value as "GEMINI" | "GROQ"; setSettings({ ...settings, featureModels: { ...settings.featureModels, [operation]: { provider, model: settings.environmentModels[provider] } } }); }} className="h-9 border bg-background px-2 text-sm"><option value="GEMINI">Gemini</option><option value="GROQ">Groq</option></select></label><label className="grid gap-1 text-xs">Model<input value={value.model} onChange={(event) => setSettings({ ...settings, featureModels: { ...settings.featureModels, [operation]: { ...value, model: event.target.value } } })} className="h-9 border bg-background px-2 text-sm" /></label></div>;
                    })}
                </div>
            </section>

            <section className="grid gap-5 border bg-card p-6 md:grid-cols-3">
                <label className="grid gap-2 text-sm">Monthly token limit<input type="number" min={1000} value={settings.monthlyTokenLimit ?? ""} onChange={(event) => setSettings({ ...settings, monthlyTokenLimit: event.target.value ? Number(event.target.value) : null })} className="h-10 border bg-background px-3" /></label>
                <label className="grid gap-2 text-sm">Monthly budget (USD)<input type="number" min={0} step="0.01" value={settings.monthlyBudgetMicros === null ? "" : settings.monthlyBudgetMicros / 1_000_000} onChange={(event) => setSettings({ ...settings, monthlyBudgetMicros: event.target.value ? Math.round(Number(event.target.value) * 1_000_000) : null })} className="h-10 border bg-background px-3" /></label>
                <label className="grid gap-2 text-sm">Maximum output tokens/request<input type="number" min={100} max={16000} value={settings.perRequestMaxTokens} onChange={(event) => setSettings({ ...settings, perRequestMaxTokens: Number(event.target.value) })} className="h-10 border bg-background px-3" /></label>
            </section>

            <div className="flex items-center gap-4"><Button onClick={save} disabled={pending}>{pending ? "Saving..." : "Save settings"}</Button>{message ? <p className="text-sm" role="status">{message}</p> : null}</div>
        </div>
    );
}
