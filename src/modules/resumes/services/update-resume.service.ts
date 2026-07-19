import type { UpdateResumeInput } from "@/modules/resumes/validations/update-resume.schema";
import { ResumeRepository } from "../repositories/resume.repository";

interface UpdateResumeServiceInput extends UpdateResumeInput {
    resumeId: string;
    userId: string;
}

export class UpdateResumeService {
    private readonly repository = new ResumeRepository();

    async execute(input: UpdateResumeServiceInput) {
        const normalizedTags = [
            ...new Set(
                input.tags
                    .map((tag) => tag.trim().toLowerCase())
                    .filter(Boolean),
            ),
        ].sort();

        return this.repository.updateMetadataAndTags(
            input.userId,
            input.resumeId,
            {
                title: input.title.trim(),
                primaryStack: input.primaryStack?.trim() || null,
                tags: normalizedTags,
            },
        );
    }
}
