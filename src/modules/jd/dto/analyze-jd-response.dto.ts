export interface AnalyzeJDResponseDto {
    jdAnalysisId: string;

    matches: {
        resumeVersionId: string;
        resumeTitle: string;

        score: number;

        confidence: "HIGH" | "MEDIUM" | "LOW";

        matchedKeywords: string[];

        missingKeywords: string[];

        weakKeywords: string[];
    }[];
}
