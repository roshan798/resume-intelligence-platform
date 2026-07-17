import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

export const redis = new IORedis(
    process.env.REDIS_URL ?? "redis://localhost:6379",
    {
        maxRetriesPerRequest: null,
    },
);

export const defaultJobOptions = {
    attempts: 3,
    removeOnComplete: 100,
    removeOnFail: 500,
    backoff: {
        type: "exponential",
        delay: 3000,
    },
};

export function createQueue(name: string) {
    return new Queue(name, {
        connection: redis,
        defaultJobOptions,
    });
}

export function createWorker(
    name: string,
    processor: ConstructorParameters<typeof Worker>[1],
) {
    return new Worker(name, processor, {
        connection: redis,
    });
}
