export interface UpdateDraftVersionDto {
    versionId: string;

    rawText?: string;

    latexSource?: string;

    parsedSections?: {
        summary?: string;
        skills?: string[];
        experience?: Array<Record<string, unknown>>;
        projects?: Array<Record<string, unknown>>;
        education?: Array<Record<string, unknown>>;
        certifications?: Array<Record<string, unknown>>;
    };

    canonicalKeywords?: Array<{
        keyword: string;
        canonicalKeyword: string;
        section: string;
        occurrences: number;
    }>;

    fileAssetId?: string;

    notes?: string;

    status?: "TAILORED_DRAFT" | "TAILORED_FINAL" | "FINAL";
}
