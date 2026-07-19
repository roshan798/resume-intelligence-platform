"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DraftSuggestion {
    id: string;
    status: "ACCEPTED" | "APPLIED" | "MANUALLY_APPLIED";
    recommendations: Array<{
        keyword: string;
        suggestedSection: string;
        suggestion: string;
        safetyNote: string;
    }>;
}

export function LatexSuggestionPanel({ versionId, suggestions }: { versionId: string; suggestions: DraftSuggestion[] }) {
    const router = useRouter();
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function applySuggestion(suggestionId: string) {
        if (!window.confirm("Apply all recommendations in this accepted suggestion to the LaTeX draft? Review the resulting source before finalizing.")) return;
        setBusyId(suggestionId);
        setError(null);
        try {
            const response = await fetch(`/api/resumes/versions/${versionId}/suggestions/${suggestionId}/apply`, { method: "POST" });
            const body = await response.json() as { message?: string };
            if (!response.ok) throw new Error(body.message || "Unable to apply suggestion.");
            router.refresh();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to apply suggestion.");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Accepted suggestions for this LaTeX draft</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Automatic application changes document-body content only. The preamble, packages, macros, and styling are protected.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestions.length === 0 ? <p className="text-sm text-muted-foreground">No accepted suggestions are linked to this JD and parent resume.</p> : null}
                {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="space-y-3 rounded border p-4">
                        <div className="flex items-center justify-between gap-3">
                            <Badge variant={suggestion.status === "ACCEPTED" ? "default" : "secondary"}>{suggestion.status}</Badge>
                            {suggestion.status === "ACCEPTED" ? (
                                <Button disabled={busyId !== null} onClick={() => applySuggestion(suggestion.id)}>
                                    {busyId === suggestion.id ? "Applying safely…" : "Apply to LaTeX draft"}
                                </Button>
                            ) : null}
                        </div>
                        {suggestion.recommendations.map((recommendation, index) => (
                            <div key={`${recommendation.keyword}-${index}`} className="text-sm">
                                <p className="font-medium">{recommendation.keyword} · {recommendation.suggestedSection}</p>
                                <p className="mt-1">{recommendation.suggestion}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{recommendation.safetyNote}</p>
                            </div>
                        ))}
                    </div>
                ))}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </CardContent>
        </Card>
    );
}
