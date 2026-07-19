import { GoogleGenAI } from "@google/genai";

import { AIConfig } from "@/lib/config/ai.config";

import type { EmbeddingResultDto } from "../dto/embedding-result.dto";
import type { EmbeddingProvider } from "./embedding-provider";

export class GeminiEmbeddingProvider implements EmbeddingProvider {
    private readonly client: GoogleGenAI;

    constructor() {
        if (!AIConfig.gemini.apiKey) {
            throw new Error("Gemini embeddings are not configured.");
        }
        this.client = new GoogleGenAI({ apiKey: AIConfig.gemini.apiKey });
    }

    async generateEmbedding(text: string): Promise<EmbeddingResultDto> {
        const normalized = text.trim();
        if (!normalized) throw new Error("Text is required for semantic search.");

        const response = await this.client.models.embedContent({
            model: AIConfig.gemini.embeddingModel,
            contents: normalized.slice(0, 7000),
            config: {
                outputDimensionality: AIConfig.gemini.embeddingDimensions,
            },
        });
        const vector = response.embeddings?.[0]?.values ?? [];
        if (vector.length !== AIConfig.gemini.embeddingDimensions) {
            throw new Error(`Gemini returned an unexpected ${vector.length}-dimension embedding.`);
        }

        return {
            embedding: vector,
            dimensions: vector.length,
            provider: "GEMINI",
            model: AIConfig.gemini.embeddingModel,
        };
    }

    getModelName() { return AIConfig.gemini.embeddingModel; }
    getProviderName() { return "GEMINI"; }
}
