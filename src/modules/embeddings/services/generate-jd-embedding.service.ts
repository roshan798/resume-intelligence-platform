// import { GeminiEmbeddingProvider } from "../providers/gemini-embedding.provider";
import { OpenAIEmbeddingProvider } from "../providers/openai-embedding.provider";

export class GenerateJDEmbeddingService {
    // private provider = new GeminiEmbeddingProvider();
    private provider = new OpenAIEmbeddingProvider()

    async execute(jdText: string) {
        return this.provider.generateEmbedding(jdText);
    }
}
