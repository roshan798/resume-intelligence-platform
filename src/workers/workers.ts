import { logger } from "@/lib/logger";

import { redis } from "./config/bullmq";
import { aiWorker } from "./processors/ai.processor";

logger.info({ workers: ["ai"], concurrency: 2 }, "Resume Intelligence workers started");

async function shutdown(signal: string) {
    logger.info({ signal }, "Shutting down workers");
    await aiWorker.close();
    await redis.quit();
    process.exit(0);
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
