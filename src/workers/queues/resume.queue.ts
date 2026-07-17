import { Queue } from "bullmq";

import { redisConfig } from "./redis";

export const resumeQueue = new Queue("resume-processing", {
    connection: redisConfig,
});
