export interface EmbeddingResultDto {
    embedding: number[];
    dimensions: number;
    provider: string;
    model: string;
}
