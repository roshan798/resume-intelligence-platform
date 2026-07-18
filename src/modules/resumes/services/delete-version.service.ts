import { ResumeVersionRepository } from "@/modules/resumes/repositories/resume-version.repository";

interface DeleteVersionInput {
    versionId: string;
    userId: string;
}

interface DeleteVersionResult {
    resumeId: string;
    deletedVersionId: string;
}

export class DeleteVersionService {
    private readonly repository = new ResumeVersionRepository();

    async execute(
        input: DeleteVersionInput,
    ): Promise<DeleteVersionResult | null> {
        const version = await this.repository.findForDeletion(
            input.versionId,
            input.userId,
        );

        if (!version) {
            return null;
        }

        const deletableStatuses = new Set(["TAILORED_DRAFT", "ARCHIVED"]);

        if (!deletableStatuses.has(version.status)) {
            throw new Error("Only draft or archived versions can be deleted.");
        }

        if (version._count.children > 0) {
            throw new Error(
                "This version cannot be deleted because other versions were created from it.",
            );
        }

        if (version._count.matchResults > 0) {
            throw new Error(
                "This version cannot be deleted because it has match results.",
            );
        }

        if (version._count.applications > 0) {
            throw new Error(
                "This version cannot be deleted because it is linked to applications.",
            );
        }

        const versionCount = await this.repository.countByResumeId(
            version.resumeId,
        );

        if (versionCount <= 1) {
            throw new Error("The only version of a resume cannot be deleted.");
        }

        await this.repository.deleteById(version.id);

        return {
            resumeId: version.resumeId,
            deletedVersionId: version.id,
        };
    }
}
