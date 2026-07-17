import { Job, Worker } from "bullmq";

import { redisConfig } from "../queues/redis";

import { RunMatchJob } from "../jobs/run-match.job";

export const matchWorker = new Worker(
    "match-processing",
    async (job: Job) => {
        switch (job.name) {
            case "run-match":
                await processMatch(job as Job<RunMatchJob>);
                break;

            default:
                throw new Error(`Unknown Match job type: ${job.name}`);
        }
    },
    {
        connection: redisConfig,
        concurrency: 5,
    },
);

async function processMatch(job: Job<RunMatchJob>) {
    const { jdAnalysisId, resumeVersionId } = job.data;

    console.log(`[Match Worker] Running ATS analysis`, {
        jdAnalysisId,
        resumeVersionId,
    });

    /*
   future:

   const service =
      new RunMatchAnalysisService();

   await service.execute(...)
  */
}

matchWorker.on("completed", (job) => {
    console.log(`[Match Worker] Completed ${job.id}`);
});

matchWorker.on("failed", (job, err) => {
    console.error(`[Match Worker] Failed ${job?.id}`, err);
});
