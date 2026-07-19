import { JDParserService } from "@/lib/matching/jd/jd-parser.service";
import { JobDescriptionRepository } from "../repositories/job-description.repository";
import type { CreateJobDescriptionInput } from "../validations/job-description.schema";

export class CreateJobDescriptionService {
    private readonly repository = new JobDescriptionRepository();
    private readonly parser = new JDParserService();

    async execute(userId: string, input: CreateJobDescriptionInput) {
        const parsed = this.parser.parse(input.rawText);

        return this.repository.createWithSnapshot(
            userId,
            {
                company: input.company?.trim() || null,
                roleTitle: input.roleTitle.trim(),
                location: input.location?.trim() || null,
                sourceUrl: input.sourceUrl?.trim() || null,
                experienceRequirements:
                    input.experienceRequirements?.trim() || null,
            },
            {
                rawText: input.rawText.trim(),
                parsedKeywords: parsed.keywords,
            },
        );
    }
}
