export interface EmbeddingResultDto {
    vector: number[];
    dimensions: number;
    provider: string;
    model: string;
}
