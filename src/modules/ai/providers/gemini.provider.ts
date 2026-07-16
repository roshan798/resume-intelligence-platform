import { AIProvider } from "./ai-provider";
import { GenerateTextRequest } from "../types/generate-text-request";
import { GenerateTextResponse } from "../types/generate-text-response";

export class GeminiProvider implements AIProvider {
    async generateText(
        request: GenerateTextRequest,
    ): Promise<GenerateTextResponse> {
        // Simulating minor processing delay
        await new Promise((resolve) => setTimeout(resolve, 200));

        return {
            text: `[Gemini Mock Response] Based on your prompt: "${request.prompt.substring(0, 30)}...", here is the structured resume analysis payload text.`,
            provider: "GEMINI",
            usage: {
                promptTokens: 120,
                completionTokens: 250,
                totalTokens: 370,
            },
        };
    }
}
