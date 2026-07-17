import { Queue } from "bullmq";

import { redisConfig } from "./redis";

export const aiQueue = new Queue("ai-processing", {
    connection: redisConfig,
});
