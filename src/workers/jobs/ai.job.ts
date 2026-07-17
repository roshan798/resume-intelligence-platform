export interface AIJob {
    resumeVersionId: string;
    jdAnalysisId?: string;
    feature: "summary" | "rewrite" | "tailored" | "keywords";
}
