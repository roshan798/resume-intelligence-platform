import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VersionSimilarityAnalysis } from "@/modules/resumes/services/get-version-similarity.service";

interface VersionSimilarityProps {
    analysis: VersionSimilarityAnalysis;
}

function formatClassification(value: string): string {
    return value
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function VersionSimilarity({ analysis }: VersionSimilarityProps) {
    if (analysis.status === "INSUFFICIENT_TEXT") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Resume Similarity</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Similarity analysis will be available after this version has
                    parsed resume text.
                </CardContent>
            </Card>
        );
    }

    if (!analysis.mostSimilar) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Resume Similarity</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    No other parsed resume versions are available for comparison.
                </CardContent>
            </Card>
        );
    }

    const match = analysis.mostSimilar;

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
                <CardTitle>Resume Similarity</CardTitle>
                <Badge variant="outline">
                    {formatClassification(match.classification)}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Most similar version
                        </p>
                        <Link
                            className="font-medium underline-offset-4 hover:underline"
                            href={`/resumes/${match.resumeId}/versions/${match.versionId}`}
                        >
                            {match.resumeTitle} · Version {match.versionNumber}
                        </Link>
                    </div>
                    <p className="text-3xl font-semibold tabular-nums">
                        {match.score}%
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Unique terms" value={match.metrics.tokenSetJaccard} />
                    <Metric
                        label="Content emphasis"
                        value={match.metrics.termFrequencyCosine}
                    />
                    <Metric
                        label="Phrase order"
                        value={match.metrics.wordBigramJaccard}
                    />
                </div>

                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {match.explanation.map((explanation) => (
                        <li key={explanation}>{explanation}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium tabular-nums">{value}%</p>
        </div>
    );
}
