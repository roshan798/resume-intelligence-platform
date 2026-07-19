import { GeminiEmbeddingProvider } from "@/modules/embeddings/providers/gemini-embedding.provider";
import { SemanticSearchRepository } from "../repositories/semantic-search.repository";
import { SemanticIndexService } from "./semantic-index.service";

export class SearchSimilarResumesService {
    private readonly repository = new SemanticSearchRepository();
    private readonly provider = new GeminiEmbeddingProvider();
    private readonly index = new SemanticIndexService();

    async execute(query: string, userId: string) {
        await this.index.ensureResumeIndex(userId);
        const result = await this.provider.generateEmbedding(query);
        return this.repository.findSimilarResumes(result.embedding, userId);
    }
}
