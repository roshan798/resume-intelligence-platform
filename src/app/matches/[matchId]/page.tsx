import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchResultRepository } from "@/modules/match/repositories/match-result.repository";

interface PageProps {
    params: Promise<{ matchId: string }>;
}

export default async function MatchPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user?.id) notFound();
    const { matchId } = await params;
    const result = await new MatchResultRepository().getByIdAndUser(
        matchId,
        session.user.id,
    );
    if (!result) notFound();

    const scores = readScores(result.sectionScores);
    const labels = readKeywordLabels(result.jdAnalysis.parsedKeywords);
    const matched = readStrings(result.matchedKeywords);
    const missing = readStrings(result.missingKeywords);
    const weak = new Set(readStrings(result.weakKeywords));

    return (
        <main className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Match breakdown</h1>
                    <p className="mt-2 text-muted-foreground">
                        {result.resumeVersion.resume.title} · Version {result.resumeVersion.versionNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Against {result.jdAnalysis.roleTitle || "job description"}
                        {result.jdAnalysis.company ? ` at ${result.jdAnalysis.company}` : ""}
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href={`/match-results/${result.jdAnalysisId}`}>Back to rankings</Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Metric label="Overall score" value={Number(result.overallScore)} />
                <Metric label="Required coverage" value={scores.requiredCoverage} detail={`${scores.requiredMatched}/${scores.requiredTotal}`} />
                <Metric label="Preferred coverage" value={scores.preferredCoverage} detail={`${scores.preferredMatched}/${scores.preferredTotal}`} />
                <Metric label="Context coverage" value={scores.contextCoverage} detail={`${scores.contextMatched}/${scores.contextTotal}`} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <KeywordCard
                    title="Matching skills"
                    description="Skills found in this resume version. A weak badge means it appears only in a lower-weight section."
                    keywords={matched}
                    labels={labels}
                    weak={weak}
                />
                <KeywordCard
                    title="Missing skills"
                    description="JD skills not detected in this resume version. Required skills should be addressed first."
                    keywords={missing}
                    labels={labels}
                />
            </div>

            <Card>
                <CardHeader><CardTitle>How the score is calculated</CardTitle></CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                    Required skills carry the greatest weight, context skills carry a
                    moderate weight, and preferred skills carry the least. A match in
                    Skills or Experience contributes more than a mention in Education
                    or another low-signal section. Matching is deterministic and does
                    not infer skills that are absent from the resume.
                </CardContent>
            </Card>
        </main>
    );
}

function Metric({ label, value, detail }: { label: string; value: number; detail?: string }) {
    return (
        <Card>
            <CardContent className="py-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value.toFixed(1)}%</p>
                {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail} skills</p> : null}
            </CardContent>
        </Card>
    );
}

function KeywordCard({ title, description, keywords, labels, weak }: {
    title: string;
    description: string;
    keywords: string[];
    labels: Map<string, { label: string; requirement: string }>;
    weak?: Set<string>;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title} ({keywords.length})</CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {keywords.length === 0 ? <p className="text-sm text-muted-foreground">None</p> : null}
                {keywords.map((keyword) => {
                    const metadata = labels.get(keyword);
                    return (
                        <Badge key={keyword} variant={weak?.has(keyword) ? "outline" : "secondary"}>
                            {metadata?.label || keyword}
                            {metadata?.requirement ? ` · ${formatRequirement(metadata.requirement)}` : ""}
                            {weak?.has(keyword) ? " · Weak placement" : ""}
                        </Badge>
                    );
                })}
            </CardContent>
        </Card>
    );
}

function readStrings(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readKeywordLabels(value: unknown): Map<string, { label: string; requirement: string }> {
    const labels = new Map<string, { label: string; requirement: string }>();
    if (!Array.isArray(value)) return labels;
    for (const item of value) {
        if (typeof item !== "object" || item === null || Array.isArray(item)) continue;
        const record = item as Record<string, unknown>;
        if (typeof record.keyword !== "string") continue;
        labels.set(record.keyword, {
            label: typeof record.displayName === "string" ? record.displayName : record.keyword,
            requirement: typeof record.requirement === "string" ? record.requirement : "",
        });
    }
    return labels;
}

function readScores(value: unknown) {
    const fallback = {
        requiredCoverage: 0, preferredCoverage: 0, contextCoverage: 0,
        requiredMatched: 0, requiredTotal: 0, preferredMatched: 0,
        preferredTotal: 0, contextMatched: 0, contextTotal: 0,
    };
    if (typeof value !== "object" || value === null || Array.isArray(value)) return fallback;
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
        Object.keys(fallback).map((key) => [key, typeof record[key] === "number" ? record[key] : 0]),
    ) as typeof fallback;
}

function formatRequirement(value: string): string {
    return value.charAt(0) + value.slice(1).toLocaleLowerCase();
}
