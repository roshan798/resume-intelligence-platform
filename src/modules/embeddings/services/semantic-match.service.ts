export class SemanticMatchService {
    cosineSimilarity(vectorA: number[], vectorB: number[]): number {
        const dot = vectorA.reduce(
            (sum, value, index) => sum + value * vectorB[index],
            0,
        );

        const magnitudeA = Math.sqrt(
            vectorA.reduce((sum, value) => sum + value * value, 0),
        );

        const magnitudeB = Math.sqrt(
            vectorB.reduce((sum, value) => sum + value * value, 0),
        );

        if (magnitudeA === 0 || magnitudeB === 0) {
            return 0;
        }

        return dot / (magnitudeA * magnitudeB);
    }

    calculateScore(resumeEmbedding: number[], jdEmbedding: number[]) {
        const similarity = this.cosineSimilarity(resumeEmbedding, jdEmbedding);

        return Number((similarity * 100).toFixed(2));
    }
}
