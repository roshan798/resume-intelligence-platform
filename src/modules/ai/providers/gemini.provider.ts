import { GoogleGenAI } from "@google/genai";

import { AIProvider } from "./ai-provider";

import { GenerateTextRequest } from "../types/generate-text-request";
import { GenerateTextResponse } from "../types/generate-text-response";

import { AIConfig } from "@/lib/config/ai.config";

export class GeminiProvider implements AIProvider {
    private client: GoogleGenAI;

    constructor() {
        if (!AIConfig.gemini.apiKey || !AIConfig.gemini.model) {
            throw new Error("Gemini generation is not configured.");
        }
        this.client = new GoogleGenAI({ apiKey: AIConfig.gemini.apiKey });
    }

    async generateText(
        request: GenerateTextRequest,
    ): Promise<GenerateTextResponse> {
        const response = await this.client.models.generateContent({
            model: AIConfig.gemini.model!,

            contents: request.prompt,

            config: {
                temperature: request.temperature ?? 0.2,

                maxOutputTokens: request.maxTokens ?? 4096,

                systemInstruction: request.systemPrompt,
                responseMimeType: request.jsonMode ? "application/json" : undefined,
            },
        });

        return {
            text: response.text ?? "",
            provider: "GEMINI",
            model: AIConfig.gemini.model!,
            usage: {
                promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
                completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
                totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
            },
        };
    }
}
