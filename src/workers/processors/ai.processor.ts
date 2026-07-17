import { Job, Worker } from "bullmq";

import { redisConfig } from "../queues/redis";

import { GenerateDraftJob } from "../jobs/generate-draft.job";

export const aiWorker = new Worker(
    "ai-processing",
    async (job: Job) => {
        switch (job.name) {
            case "generate-tailored-draft":
                await processTailoredDraft(job as Job<GenerateDraftJob>);
                break;

            case "rewrite-bullets":
                await processBulletRewrite(job);
                break;

            case "generate-summary":
                await processSummary(job);
                break;

            default:
                throw new Error(`Unknown AI job type: ${job.name}`);
        }
    },
    {
        connection: redisConfig,
        concurrency: 2,
    },
);

async function processTailoredDraft(job: Job<GenerateDraftJob>) {
    const { resumeVersionId, jdAnalysisId } = job.data;

    console.log(
        `[AI Worker] Generating draft for resume=${resumeVersionId} jd=${jdAnalysisId}`,
    );

    /*
   future implementation:

   const service =
     new GenerateTailoredDraftService();

   await service.execute(...)
  */
}

async function processBulletRewrite(job: Job) {
    console.log(`[AI Worker] Rewriting bullets`, job.data);
}

async function processSummary(job: Job) {
    console.log(`[AI Worker] Generating summary`, job.data);
}

aiWorker.on("completed", (job) => {
    console.log(`[AI Worker] Job completed ${job.id}`);
});

aiWorker.on("failed", (job, err) => {
    console.error(`[AI Worker] Job failed ${job?.id}`, err);
});
