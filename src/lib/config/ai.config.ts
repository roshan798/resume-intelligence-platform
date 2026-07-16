import { Config as env } from "./index";

export const AIConfig = {
    defaultProvider: env.AI_DEFAULT_PROVIDER,

    timeoutMs: env.AI_TIMEOUT_MS,

    retryCount: env.AI_RETRY_COUNT,
};
