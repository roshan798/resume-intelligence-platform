import { AIProvider } from "@/shared/enums/ai-provider.enum";

import { GeminiProvider } from "../providers/gemini.provider";
import { GroqProvider } from "../providers/groq.provider";

export class AIProviderFactory {
    create(provider: AIProvider) {
        switch (provider) {
            case AIProvider.GEMINI:
                return new GeminiProvider();

            case AIProvider.GROQ:
                return new GroqProvider();

            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}
