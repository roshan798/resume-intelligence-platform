"use client";

import { FormattingHealthCard } from "./formatting-health-card";
import { KeywordList } from "./keyword-list";
import { SectionScoreCard } from "./section-score-card";

interface MatchDetailDrawerProps {
    open: boolean;
    onClose: () => void;
    overallScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    weakKeywords: string[];
    sectionScores: Record<string, number>;
    formattingHealth: {
        score: number;
        warnings: string[];
    };
}

export function MatchDetailDrawer({
    open,
    onClose,
    overallScore,
    matchedKeywords,
    missingKeywords,
    weakKeywords,
    sectionScores,
    formattingHealth,
}: MatchDetailDrawerProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
            <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Match Details</h2>
                        <p className="text-sm text-gray-500">
                            Deterministic Resume Analysis
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded border px-3 py-2 hover:bg-gray-100">
                        Close
                    </button>
                </div>

                <div className="mb-8 rounded-lg border p-6 text-center">
                    <p className="text-sm text-gray-500">Overall Match Score</p>

                    <h1 className="text-5xl font-bold text-green-600">
                        {overallScore}%
                    </h1>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <KeywordList
                        title="Matched"
                        keywords={matchedKeywords}
                        variant="matched"
                    />

                    <KeywordList
                        title="Missing"
                        keywords={missingKeywords}
                        variant="missing"
                    />

                    <KeywordList
                        title="Weak"
                        keywords={weakKeywords}
                        variant="weak"
                    />
                </div>

                <div className="mt-8">
                    <SectionScoreCard sectionScores={sectionScores} />
                </div>

                <div className="mt-8">
                    <FormattingHealthCard
                        score={formattingHealth.score}
                        warnings={formattingHealth.warnings}
                    />
                </div>
            </div>
        </div>
    );
}
