import { EmbeddingResultDto } from "../dto/embedding-result.dto";

export interface EmbeddingProvider {
    generateEmbedding(text: string): Promise<EmbeddingResultDto>;

    getModelName(): string;

    getProviderName(): string;
}
