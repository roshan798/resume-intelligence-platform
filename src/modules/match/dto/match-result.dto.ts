export interface MatchResultDto {
    resumeVersionId: string;

    resumeTitle: string;

    versionNumber: number;

    overallScore: number;

    matchedKeywordCount: number;

    missingKeywordCount: number;

    weakKeywordCount: number;

    tags: string[];

    explanation: string;
}
