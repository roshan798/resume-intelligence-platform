import { ResumeVersionRepository } from "@/modules/resumes/repositories/resume-version.repository";

export type ResumeDownloadFormat = "txt" | "tex";

interface DownloadVersionInput {
    versionId: string;
    userId: string;
    format: ResumeDownloadFormat;
}

interface DownloadVersionResult {
    content: string;
    contentType: string;
    fileName: string;
}

export class DownloadVersionService {
    private readonly repository = new ResumeVersionRepository();

    async execute(
        input: DownloadVersionInput,
    ): Promise<DownloadVersionResult | null> {
        const version = await this.repository.findDetailedVersion(
            input.versionId,
            input.userId,
        );

        if (!version) {
            return null;
        }

        const safeTitle = this.createSafeFileName(version.resume.title);

        const versionSuffix = `v${version.versionNumber}`;

        if (input.format === "tex") {
            if (!version.latexSource?.trim()) {
                throw new Error(
                    "This resume version does not contain LaTeX source.",
                );
            }

            return {
                content: version.latexSource,
                contentType: "application/x-tex; charset=utf-8",
                fileName: `${safeTitle}-${versionSuffix}.tex`,
            };
        }

        if (!version.rawText?.trim()) {
            throw new Error(
                "This resume version does not contain resume text.",
            );
        }

        return {
            content: version.rawText,
            contentType: "text/plain; charset=utf-8",
            fileName: `${safeTitle}-${versionSuffix}.txt`,
        };
    }

    private createSafeFileName(value: string): string {
        const normalized = value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        return normalized || "resume";
    }
}
