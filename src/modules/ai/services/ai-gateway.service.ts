import { randomUUID } from "node:crypto";

import { AIConfig } from "@/lib/config/ai.config";
import { logger } from "@/lib/logger";
import { AIProvider as AIProviderEnum } from "@/shared/enums/ai-provider.enum";

import { AIProviderFactory } from "../factory/ai-provider.factory";
import { AISettingsService } from "./ai-settings.service";
import type { GenerateTextRequest } from "../types/generate-text-request";
import type { GenerateTextResponse } from "../types/generate-text-response";

const DEFAULT_TIMEOUT_MS = 30_000;

export class AIGatewayService {
    private readonly settings = new AISettingsService();

    async generate(request: GenerateTextRequest): Promise<GenerateTextResponse> {
        const requestId = request.requestId ?? randomUUID();
        const operation = request.operation ?? "unspecified";
        const policy = request.userId
            ? await this.settings.getExecutionPolicy(request.userId, operation)
            : null;
        const selectedProvider = policy?.featureModel?.provider ?? policy?.preferredProvider;
        const preferred = selectedProvider
            ? selectedProvider === "GEMINI" ? AIProviderEnum.GEMINI : AIProviderEnum.GROQ
            : AIConfig.defaultProvider === "gemini" ? AIProviderEnum.GEMINI : AIProviderEnum.GROQ;
        const fallback = preferred === AIProviderEnum.GROQ ? AIProviderEnum.GEMINI : AIProviderEnum.GROQ;
        const providers = policy?.fallbackEnabled === false ? [preferred] : [preferred, fallback];
        const effectiveMaxTokens = Math.min(
            request.maxTokens ?? policy?.perRequestMaxTokens ?? 4_096,
            policy?.perRequestMaxTokens ?? Number.POSITIVE_INFINITY,
        );
        let lastError: unknown;

        for (const provider of providers) {
            for (let attempt = 1; attempt <= 2; attempt += 1) {
                const startedAt = Date.now();
                try {
                    const response = await withTimeout(
                        AIProviderFactory.create(provider).generateText({
                            ...request,
                            maxTokens: effectiveMaxTokens,
                            model:
                                policy?.featureModel?.provider.toLocaleLowerCase() === provider
                                    ? policy.featureModel.model
                                    : undefined,
                        }),
                        request.timeoutMs ?? DEFAULT_TIMEOUT_MS,
                    );
                    logger.info({
                        requestId,
                        operation,
                        provider: response.provider,
                        model: response.model,
                        attempt,
                        durationMs: Date.now() - startedAt,
                        maxTokens: effectiveMaxTokens,
                        ...response.usage,
                    }, "AI generation completed");
                    if (request.userId) {
                        try {
                            await this.settings.recordUsage({
                                userId: request.userId,
                                operation,
                                provider: response.provider === "GEMINI" ? "GEMINI" : "GROQ",
                                modelUsed: response.model,
                                promptTokens: response.usage?.promptTokens ?? 0,
                                completionTokens: response.usage?.completionTokens ?? 0,
                                totalTokens: response.usage?.totalTokens ?? 0,
                                estimatedCostMicros: 0,
                                requestId,
                            });
                        } catch (usageError) {
                            logger.error({ err: usageError, requestId, operation }, "Failed to persist AI usage");
                        }
                    }
                    return response;
                } catch (error) {
                    lastError = error;
                    const retryable = isRetryable(error);
                    logger.warn({
                        err: error,
                        requestId,
                        operation,
                        provider,
                        attempt,
                        retryable,
                        durationMs: Date.now() - startedAt,
                    }, "AI generation attempt failed");
                    if (!retryable) break;
                }
            }
        }

        logger.error({ err: lastError, requestId, operation }, "All AI providers failed");
        throw lastError instanceof Error ? lastError : new Error("No configured AI provider is available.");
    }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
        return await Promise.race([
            promise,
            new Promise<never>((_, reject) => {
                timeout = setTimeout(() => reject(new Error(`AI request timed out after ${timeoutMs}ms.`)), timeoutMs);
            }),
        ]);
    } finally {
        if (timeout) clearTimeout(timeout);
    }
}

function isRetryable(error: unknown): boolean {
    if (!(error instanceof Error)) return true;
    const value = `${error.name} ${error.message}`.toLocaleLowerCase();
    return value.includes("timeout") || value.includes("timed out") || value.includes("429") || value.includes("rate limit") || /\b5\d\d\b/u.test(value) || value.includes("network") || value.includes("fetch");
}
