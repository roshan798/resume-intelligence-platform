import { JDParserService } from "@/lib/matching/jd/jd-parser.service";
import { JobDescriptionRepository } from "../repositories/job-description.repository";

export class CreateJobDescriptionSnapshotService {
    private readonly repository = new JobDescriptionRepository();
    private readonly parser = new JDParserService();

    execute(id: string, userId: string, rawText: string) {
        const parsed = this.parser.parse(rawText);

        return this.repository.createSnapshot(id, userId, {
            rawText: rawText.trim(),
            parsedKeywords: parsed.keywords,
        });
    }
}
