import { Queue } from "bullmq";

import { redisConfig } from "./redis";

export const matchQueue = new Queue("match-processing", {
    connection: redisConfig,
});
