import { AIProvider, Prisma } from "@prisma/client";

import { AIConfig } from "@/lib/config/ai.config";
import { prisma } from "@/lib/prisma";

export interface FeatureModelSetting {
    provider: "GEMINI" | "GROQ";
    model: string;
}

const defaults = {
    preferredProvider: AIProvider.GEMINI,
    fallbackEnabled: true,
    featureModels: {} as Record<string, FeatureModelSetting>,
    monthlyTokenLimit: 200_000 as number | null,
    monthlyBudgetMicros: null as number | null,
    perRequestMaxTokens: 4_000,
};

export class AISettingsService {
    async get(userId: string) {
        const stored = await prisma.aISettings.findUnique({ where: { userId } });
        return {
            ...defaults,
            ...stored,
            preferredProvider:
                stored?.preferredProvider === AIProvider.GROQ
                    ? ("GROQ" as const)
                    : ("GEMINI" as const),
            featureModels: readFeatureModels(stored?.featureModels),
            configuredProviders: {
                GEMINI: Boolean(AIConfig.gemini.apiKey && AIConfig.gemini.model),
                GROQ: Boolean(AIConfig.groq.apiKey && AIConfig.groq.model),
            },
            environmentModels: {
                GEMINI: AIConfig.gemini.model ?? "",
                GROQ: AIConfig.groq.model ?? "",
            },
        };
    }

    async update(userId: string, input: {
        preferredProvider: "GEMINI" | "GROQ";
        fallbackEnabled: boolean;
        featureModels: Record<string, FeatureModelSetting>;
        monthlyTokenLimit: number | null;
        monthlyBudgetMicros: number | null;
        perRequestMaxTokens: number;
    }) {
        return prisma.aISettings.upsert({
            where: { userId },
            create: {
                userId,
                ...input,
                preferredProvider: AIProvider[input.preferredProvider],
                featureModels: input.featureModels as unknown as Prisma.InputJsonValue,
            },
            update: {
                ...input,
                preferredProvider: AIProvider[input.preferredProvider],
                featureModels: input.featureModels as unknown as Prisma.InputJsonValue,
            },
        });
    }

    async getExecutionPolicy(userId: string, operation: string) {
        const settings = await this.get(userId);
        const start = new Date();
        start.setUTCDate(1);
        start.setUTCHours(0, 0, 0, 0);
        const usage = await prisma.aIUsage.aggregate({
            where: { userId, createdAt: { gte: start } },
            _sum: { totalTokens: true, estimatedCostMicros: true },
        });
        const tokensUsed = usage._sum.totalTokens ?? 0;
        const costUsed = usage._sum.estimatedCostMicros ?? 0;
        if (settings.monthlyTokenLimit !== null && tokensUsed >= settings.monthlyTokenLimit) {
            throw new Error("Monthly AI token limit reached. Update it in Settings before generating more content.");
        }
        if (settings.monthlyBudgetMicros !== null && settings.monthlyBudgetMicros > 0 && costUsed >= settings.monthlyBudgetMicros) {
            throw new Error("Monthly AI budget reached. Update it in Settings before generating more content.");
        }
        return { ...settings, featureModel: settings.featureModels[operation], tokensUsed, costUsed };
    }

    recordUsage(input: {
        userId: string;
        operation: string;
        provider: "GEMINI" | "GROQ";
        modelUsed: string;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        estimatedCostMicros: number;
        requestId: string;
    }) {
        return prisma.aIUsage.create({ data: { ...input, provider: AIProvider[input.provider] } });
    }
}

function readFeatureModels(value: unknown): Record<string, FeatureModelSetting> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
    const result: Record<string, FeatureModelSetting> = {};
    for (const [operation, setting] of Object.entries(value)) {
        if (typeof setting !== "object" || setting === null || Array.isArray(setting)) continue;
        const record = setting as Record<string, unknown>;
        if ((record.provider === "GEMINI" || record.provider === "GROQ") && typeof record.model === "string") {
            result[operation] = { provider: record.provider, model: record.model };
        }
    }
    return result;
}
