import { Job, Worker } from "bullmq";

import { logger } from "@/lib/logger";
import { AISuggestionService } from "@/modules/ai/services/ai-suggestion.service";
import { BackgroundJobRepository } from "@/modules/background-jobs/repositories/background-job.repository";
import { redis } from "../config/bullmq";

interface SuggestionJob {
    backgroundJobId: string;
    matchResultId: string;
    userId: string;
}

export const aiWorker = new Worker(
    "ai",
    async (job: Job) => {
        if (job.name !== "generate-match-suggestions") throw new Error(`Unknown AI job type: ${job.name}`);
        const data = job.data as SuggestionJob;
        const repository = new BackgroundJobRepository();
        await repository.update(data.backgroundJobId, { status: "ACTIVE", startedAt: new Date(), progress: 10 });
        try {
            const suggestion = await new AISuggestionService().generateFromMatch(data.matchResultId, data.userId);
            if (!suggestion) throw new Error("Match result not found.");
            await repository.complete(data.backgroundJobId, { suggestionId: suggestion.id });
            return { suggestionId: suggestion.id };
        } catch (error) {
            await repository.fail(data.backgroundJobId, error instanceof Error ? error.message : "AI job failed");
            throw error;
        }
    },
    { connection: redis, concurrency: 2 },
);

aiWorker.on("completed", (job) => logger.info({ queueJobId: job.id }, "AI background job completed"));
aiWorker.on("failed", (job, error) => logger.error({ err: error, queueJobId: job?.id }, "AI background job failed"));
