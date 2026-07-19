import { AIConfig } from "@/lib/config/ai.config";
import { AIProvider as AIProviderEnum } from "@/shared/enums/ai-provider.enum";

import { AIProviderFactory } from "../factory/ai-provider.factory";
import type { GenerateTextRequest } from "../types/generate-text-request";

export class AIGatewayService {
    async generate(request: GenerateTextRequest) {
        const preferred =
            AIConfig.defaultProvider === "gemini"
                ? AIProviderEnum.GEMINI
                : AIProviderEnum.GROQ;
        const fallback =
            preferred === AIProviderEnum.GROQ
                ? AIProviderEnum.GEMINI
                : AIProviderEnum.GROQ;
        let lastError: unknown;

        for (const provider of [preferred, fallback]) {
            try {
                return await AIProviderFactory.create(provider).generateText(request);
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError instanceof Error
            ? lastError
            : new Error("No configured AI provider is available.");
    }
}
