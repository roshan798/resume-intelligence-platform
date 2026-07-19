import { GeminiEmbeddingProvider } from "../providers/gemini-embedding.provider";

export class GenerateJDEmbeddingService {
    private readonly provider = new GeminiEmbeddingProvider();
    execute(jdText: string) { return this.provider.generateEmbedding(jdText); }
}
