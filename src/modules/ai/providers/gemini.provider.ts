import { GoogleGenAI } from "@google/genai";

import { AIProvider } from "./ai-provider";

import { GenerateTextRequest } from "../types/generate-text-request";
import { GenerateTextResponse } from "../types/generate-text-response";
import type { GenerateTextStreamEvent } from "../types/generate-text-stream-event";

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
        const model = request.model ?? AIConfig.gemini.model!;
        const response = await this.client.models.generateContent({
            model,

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
            model,
            usage: {
                promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
                completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
                totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
            },
        };
    }

    async *generateTextStream(
        request: GenerateTextRequest,
    ): AsyncGenerator<GenerateTextStreamEvent> {
        const model = request.model ?? AIConfig.gemini.model!;
        const stream = await this.client.models.generateContentStream({
            model,
            contents: request.prompt,
            config: {
                temperature: request.temperature ?? 0.2,
                maxOutputTokens: request.maxTokens ?? 4096,
                systemInstruction: request.systemPrompt,
            },
        });
        let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
        for await (const chunk of stream) {
            if (chunk.text) yield { type: "delta", text: chunk.text };
            if (chunk.usageMetadata) {
                usage = {
                    promptTokens: chunk.usageMetadata.promptTokenCount ?? 0,
                    completionTokens: chunk.usageMetadata.candidatesTokenCount ?? 0,
                    totalTokens: chunk.usageMetadata.totalTokenCount ?? 0,
                };
            }
        }
        yield { type: "done", response: { provider: "GEMINI", model, usage } };
    }
}
