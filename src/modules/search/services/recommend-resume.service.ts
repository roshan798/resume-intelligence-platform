import { GenerateJDEmbeddingService } from "@/modules/embeddings/services/generate-jd-embedding.service";
import { SemanticSearchRepository } from "../repositories/semantic-search.repository";
import { SemanticIndexService } from "./semantic-index.service";

export class RecommendResumeService {
    private embeddingService = new GenerateJDEmbeddingService();

    private repository = new SemanticSearchRepository();
    private index = new SemanticIndexService();

    async execute(jdText: string, userId: string) {
        await this.index.ensureResumeIndex(userId);
        const embedding = await this.embeddingService.execute(jdText);

        const matches = await this.repository.findSimilarResumes(
            embedding.embedding,
            userId,
        );

        return matches[0] ?? null;
    }
}
