export interface MatchScore {
    overallScore: number;

    matchedKeywords: string[];

    missingKeywords: string[];

    weakKeywords: string[];

    sectionScores: Record<string, number>;
}
