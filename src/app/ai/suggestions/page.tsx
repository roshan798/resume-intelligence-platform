import { auth } from "@/auth";
import { SuggestionStatusActions } from "@/components/ai/suggestion-status-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AISuggestionService } from "@/modules/ai/services/ai-suggestion.service";

export default async function SuggestionsPage() {
    const session = await auth();
    const suggestions = session?.user?.id
        ? await new AISuggestionService().list(session.user.id)
        : [];

    return (
        <main className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
            <div>
                <h1 className="text-3xl font-bold">AI suggestions</h1>
                <p className="mt-2 text-muted-foreground">
                    Advisory recommendations derived from deterministic match findings.
                </p>
            </div>

            {suggestions.length === 0 ? (
                <Card><CardContent className="py-10 text-center text-muted-foreground">
                    No suggestions yet. Open a match breakdown to generate them.
                </CardContent></Card>
            ) : suggestions.map((suggestion) => {
                const recommendations = readRecommendations(suggestion.outputPayload);
                return (
                    <Card key={suggestion.id}>
                        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <CardTitle>{suggestion.resumeVersion.resume.title} · Version {suggestion.resumeVersion.versionNumber}</CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {suggestion.jdAnalysis?.roleTitle || "Job description"}
                                    {suggestion.jdAnalysis?.company ? ` at ${suggestion.jdAnalysis.company}` : ""}
                                </p>
                            </div>
                            <Badge variant={suggestion.status === "PROPOSED" ? "default" : "secondary"}>{suggestion.status}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-3">
                                {recommendations.map((item, index) => (
                                    <div key={`${item.keyword}-${index}`} className="rounded border p-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">{item.keyword}</Badge>
                                            <Badge variant="secondary">{item.suggestedSection}</Badge>
                                        </div>
                                        <p className="mt-3 text-sm">{item.suggestion}</p>
                                        <p className="mt-2 text-xs text-muted-foreground">Why: {item.reason}</p>
                                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">Safety: {item.safetyNote}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Provider: {suggestion.provider} · Model: {suggestion.modelUsed} · Tokens: {suggestion.totalTokens} · Estimated cost: ${(suggestion.estimatedCostMicros / 1_000_000).toFixed(6)}
                            </p>
                            {suggestion.status === "PROPOSED" ? <SuggestionStatusActions id={suggestion.id} /> : null}
                        </CardContent>
                    </Card>
                );
            })}
        </main>
    );
}

interface Recommendation {
    keyword: string;
    reason: string;
    suggestedSection: string;
    suggestion: string;
    safetyNote: string;
}

function readRecommendations(value: unknown): Recommendation[] {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return [];
    const items = (value as Record<string, unknown>).recommendations;
    if (!Array.isArray(items)) return [];
    return items.flatMap((item) => {
        if (typeof item !== "object" || item === null || Array.isArray(item)) return [];
        const record = item as Record<string, unknown>;
        if (![record.keyword, record.reason, record.suggestedSection, record.suggestion, record.safetyNote].every((field) => typeof field === "string")) return [];
        return [record as unknown as Recommendation];
    });
}
