export interface MatchDetailDto {
    overallScore: number;

    sectionScores: Record<string, number>;

    matchedKeywords: string[];

    missingKeywords: string[];

    weakKeywords: string[];

    formattingHealth: {
        score: number;

        warnings: string[];
    };
}
