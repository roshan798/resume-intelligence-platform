import { GoogleGenAI } from "@google/genai";

import { EmbeddingProvider } from "./embedding-provider";
import { EmbeddingResultDto } from "../dto/embedding-result.dto";

export class GeminiEmbeddingProvider implements EmbeddingProvider {
    private client = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
    });

    async generateEmbedding(text: string): Promise<EmbeddingResultDto> {
        const response = await this.client.models.embedContent({
            model: "text-embedding-004",
            contents: text,
        });

        const vector = response.embeddings?.[0]?.values ?? [];

        return {
            embedding: vector,
            dimensions: vector.length,
            provider: "GEMINI",
            model: "text-embedding-004",
        };
    }

    getModelName() {
        return "text-embedding-004";
    }

    getProviderName() {
        return "GEMINI";
    }
}
