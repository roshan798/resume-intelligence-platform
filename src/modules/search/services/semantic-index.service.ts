import { GeminiEmbeddingProvider } from "@/modules/embeddings/providers/gemini-embedding.provider";

import { SemanticSearchRepository } from "../repositories/semantic-search.repository";

export class SemanticIndexService {
    private readonly provider = new GeminiEmbeddingProvider();
    private readonly repository = new SemanticSearchRepository();

    async ensureResumeIndex(userId: string) {
        const records = await this.repository.findUnembeddedResumes(userId);
        for (const record of records) {
            const result = await this.provider.generateEmbedding(record.rawText);
            await this.repository.updateResumeEmbedding(record.id, userId, result.embedding);
        }
        return records.length;
    }

    async ensureJDIndex(userId: string) {
        const records = await this.repository.findUnembeddedJDs(userId);
        for (const record of records) {
            const result = await this.provider.generateEmbedding(record.rawText);
            await this.repository.updateJDEmbedding(record.id, userId, result.embedding);
        }
        return records.length;
    }
}
