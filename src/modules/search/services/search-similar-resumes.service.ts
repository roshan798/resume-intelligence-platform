import { OpenAIEmbeddingProvider } from "../../embeddings/providers/openai-embedding.provider";
import { SemanticSearchRepository } from "../repositories/semantic-search.repository";

export class SearchSimilarResumesService {
    private repository = new SemanticSearchRepository();

    private provider = new OpenAIEmbeddingProvider();

    async execute(query: string, userId: string) {
        const embeddingResult = await this.provider.generateEmbedding(query);

        return this.repository.findSimilarResumes(embeddingResult.embedding, userId);
    }
}
