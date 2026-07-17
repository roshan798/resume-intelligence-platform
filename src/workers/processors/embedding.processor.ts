import { Job } from "bullmq";

import { BaseProcessor } from "./base.processor";

import { EmbeddingJob } from "../jobs/embedding.job";

import { GenerateResumeEmbeddingService } from "@/modules/embeddings/services/generate-resume-embedding.service";
import { GenerateJDEmbeddingService } from "@/modules/embeddings/services/generate-jd-embedding.service";

export class EmbeddingProcessor extends BaseProcessor<EmbeddingJob> {
    private readonly resume = new GenerateResumeEmbeddingService();

    private readonly jd = new GenerateJDEmbeddingService();

    async process(job: Job<EmbeddingJob>) {
        try {
            await this.start(job);

            await this.progress(job, 20);

            if (job.data.entityType === "resume") {
                await this.resume.execute(job.data.entityId);
            } else {
                await this.jd.execute(job.data.entityId);
            }

            await this.progress(job, 100);

            await this.complete(job);
        } catch (error) {
            await this.fail(job, error);

            throw error;
        }
    }
}
