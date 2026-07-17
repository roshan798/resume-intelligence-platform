import { GenerateJDEmbeddingService } from "@/modules/embeddings/services/generate-jd-embedding.service";
import { SemanticSearchRepository } from "../repositories/semantic-search.repository";

export class RecommendResumeService {
    private embeddingService = new GenerateJDEmbeddingService();

    private repository = new SemanticSearchRepository();

    async execute(jdText: string) {
        const embedding = await this.embeddingService.execute(jdText);

        const matches = await this.repository.findSimilarResumes(
            embedding.embedding,
        );

        return matches[0] ?? null;
    }
}
