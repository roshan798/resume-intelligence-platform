import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchResultRepository } from "@/modules/match/repositories/match-result.repository";

interface PageProps {
    params: Promise<{ jdId: string }>;
}

export default async function MatchResultsPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user?.id) notFound();
    const { jdId } = await params;
    const results = await new MatchResultRepository().getByAnalysisAndUser(
        jdId,
        session.user.id,
    );

    return (
        <main className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Ranked resume matches</h1>
                    <p className="mt-2 text-muted-foreground">
                        Active resume versions ranked by deterministic JD coverage.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/job-descriptions">Job descriptions</Link>
                </Button>
            </div>

            {results.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        No results are stored for this snapshot. Run matching from the
                        job description page first.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {results.map((result, index) => {
                        const scores = readSectionScores(result.sectionScores);
                        const matched = readStrings(result.matchedKeywords);
                        const missing = readStrings(result.missingKeywords);
                        return (
                            <Card key={result.id}>
                                <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Rank #{index + 1} · Version {result.resumeVersion.versionNumber}
                                        </p>
                                        <CardTitle>{result.resumeVersion.resume.title}</CardTitle>
                                    </div>
                                    <ScoreBadge score={Number(result.overallScore)} />
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <Metric label="Required coverage" value={scores.requiredCoverage} />
                                        <Metric label="Preferred coverage" value={scores.preferredCoverage} />
                                        <Metric label="Matched skills" value={matched.length} suffix="" />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {matched.slice(0, 12).map((keyword) => (
                                            <Badge key={keyword} variant="secondary">{keyword}</Badge>
                                        ))}
                                        {missing.slice(0, 8).map((keyword) => (
                                            <Badge key={keyword} variant="outline">Missing: {keyword}</Badge>
                                        ))}
                                    </div>
                                    <Button asChild variant="outline">
                                        <Link href={`/matches/${result.id}`}>View score breakdown</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

function ScoreBadge({ score }: { score: number }) {
    return <Badge className="px-4 py-2 text-base">{score.toFixed(1)}% overall</Badge>;
}

function Metric({ label, value, suffix = "%" }: { label: string; value: number; suffix?: string }) {
    return (
        <div className="rounded border p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold">{value.toFixed(suffix ? 1 : 0)}{suffix}</p>
        </div>
    );
}

function readStrings(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readSectionScores(value: unknown): { requiredCoverage: number; preferredCoverage: number } {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return { requiredCoverage: 0, preferredCoverage: 0 };
    }
    const record = value as Record<string, unknown>;
    return {
        requiredCoverage: typeof record.requiredCoverage === "number" ? record.requiredCoverage : 0,
        preferredCoverage: typeof record.preferredCoverage === "number" ? record.preferredCoverage : 0,
    };
}
