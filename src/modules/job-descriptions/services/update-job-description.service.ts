import { JobDescriptionRepository } from "../repositories/job-description.repository";
import type { UpdateJobDescriptionInput } from "../validations/job-description.schema";

export class UpdateJobDescriptionService {
    private readonly repository = new JobDescriptionRepository();

    execute(id: string, userId: string, input: UpdateJobDescriptionInput) {
        return this.repository.updateMetadata(id, userId, {
            company: input.company?.trim() || null,
            roleTitle: input.roleTitle.trim(),
            location: input.location?.trim() || null,
            sourceUrl: input.sourceUrl?.trim() || null,
            experienceRequirements:
                input.experienceRequirements?.trim() || null,
        });
    }
}
