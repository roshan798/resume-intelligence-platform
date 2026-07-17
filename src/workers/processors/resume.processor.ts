import { Worker } from "bullmq";

import { redisConfig } from "../queues/redis";

export const resumeWorker = new Worker(
    "resume-processing",
    async (job) => {
        switch (job.name) {
            case "parse-resume":
                console.log(job.data);
                break;
        }
    },
    {
        connection: redisConfig,
    },
);
