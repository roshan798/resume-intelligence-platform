import { NotFoundError } from "@/shared/errors/not-found.error";
import { ResumeVersionRepository } from "../repositories/resume-version.repository";
import { Prisma } from "@prisma/client";

export class ForkVersionService {
    private repository = new ResumeVersionRepository();

    async execute(sourceVersionId: string, userId: string, jdSnapshotId?: string) {
        const source = await this.repository.findByIdAndUser(sourceVersionId, userId);
        if (!source) {
            throw new NotFoundError("Resume version");
        }

        const nextVersion = await this.repository.getLatestVersionNumber(
            source.resumeId,
        );

        return this.repository.createVersion({
            resumeId: source.resumeId,
            parentVersionId: source.id,
            versionNumber: nextVersion + 1,
            status: "TAILORED_DRAFT",
            sourceFormat: source.sourceFormat,
            rawText: source.rawText,
            parsedSections: source.parsedSections as Prisma.InputJsonValue,
            canonicalKeywords:
                source.canonicalKeywords as Prisma.InputJsonValue,
            latexSource: source.latexSource,
            latexStyleSource: source.latexStyleSource,
            latexStyleFilename: source.latexStyleFilename,
            fileAssetId: source.fileAssetId,
            fingerprintHash: source.fingerprintHash,
            jdSnapshotId,
        });
    }
}
