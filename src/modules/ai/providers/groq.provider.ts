import { AIProvider } from "./ai-provider";
import { GenerateTextRequest } from "../types/generate-text-request";
import { GenerateTextResponse } from "../types/generate-text-response";

export class GroqProvider implements AIProvider {
    async generateText(
        request: GenerateTextRequest,
    ): Promise<GenerateTextResponse> {
        // Simulating minor processing delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        return {
            text: `[Groq Mock Response] Successfully processed keywords profile. Request modeled on: ${request.model || "llama-3.x"}.`,
            provider: "GROQ",
            usage: {
                promptTokens: 140,
                completionTokens: 180,
                totalTokens: 320,
            },
        };
    }
}
