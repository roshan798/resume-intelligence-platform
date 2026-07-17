import OpenAI from "openai";

import { EmbeddingResultDto } from "../dto/embedding-result.dto";
import { EmbeddingProvider } from "./embedding-provider";

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
    private client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    async generateEmbedding(text: string): Promise<EmbeddingResultDto> {
        const response = await this.client.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
        });

        return {
            vector: response.data[0].embedding,
            dimensions: response.data[0].embedding.length,
            provider: "OPENAI",
            model: "text-embedding-3-small",
        };
    }

    getModelName() {
        return "text-embedding-3-small";
    }

    getProviderName() {
        return "OPENAI";
    }
}
