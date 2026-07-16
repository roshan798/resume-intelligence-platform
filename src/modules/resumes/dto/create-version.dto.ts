export interface CreateVersionDto {
    resumeId: string;
    sourceFormat: string;
    rawText: string;
    parsedSections: Record<string, unknown>;
    canonicalKeywords: Record<string, unknown>;
    latexSource?: string;
    fileAssetId?: string;
    jdSnapshotId?: string;
    parentVersionId?: string;
    status: "master" | "tailored_draft" | "final" | "archived";
}
