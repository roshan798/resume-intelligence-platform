import { AIProvider as AIProviderEnum } from "@/shared/enums/ai-provider.enum";

import { AIProviderFactory } from "../factory/ai-provider.factory";

import { GenerateTextRequest } from "../types/generate-text-request";

export class AIGatewayService {
    async generate(request: GenerateTextRequest) {
        const providers = [AIProviderEnum.GROQ, AIProviderEnum.GEMINI];

        let lastError;

        for (const provider of providers) {
            try {
                const client = AIProviderFactory.create(provider);

                return await client.generateText(request);
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError;
    }
}
