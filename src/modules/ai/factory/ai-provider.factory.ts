import { AIProvider as AIProviderEnum } from "@/shared/enums/ai-provider.enum";

import { AIProvider } from "../providers/ai-provider";

import { GroqProvider } from "../providers/groq.provider";
import { GeminiProvider } from "../providers/gemini.provider";

export class AIProviderFactory {
    // Parameter uses the enum alias, return type uses your base class
    static create(provider: AIProviderEnum): AIProvider {
        switch (provider) {
            case AIProviderEnum.GROQ:
                return new GroqProvider();

            case AIProviderEnum.GEMINI:
                return new GeminiProvider();

            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}