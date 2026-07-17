import { createQueue } from "../config/bullmq";

export const embeddingQueue = createQueue("embedding");