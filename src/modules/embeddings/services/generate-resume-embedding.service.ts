// import { GeminiEmbeddingProvider } from "../providers/gemini-embedding.provider";

import { OpenAIEmbeddingProvider } from "../providers/openai-embedding.provider";

export class GenerateResumeEmbeddingService {
    // private provider = new GeminiEmbeddingProvider();
    private provider = new OpenAIEmbeddingProvider()

    async execute(resumeText: string) {
        return this.provider.generateEmbedding(resumeText);
    }
}
