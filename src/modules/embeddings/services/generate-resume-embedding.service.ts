import { GeminiEmbeddingProvider } from "../providers/gemini-embedding.provider";

export class GenerateResumeEmbeddingService {
    private readonly provider = new GeminiEmbeddingProvider();
    execute(resumeText: string) { return this.provider.generateEmbedding(resumeText); }
}
