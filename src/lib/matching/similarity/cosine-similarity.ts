// cosine-similarity.ts

/**
 * Calculates the Cosine Similarity between two text keyword arrays,
 * factoring in the frequency of each keyword.
 *
 * Formula: (A · B) / (||A|| * ||B||)
 * Returns a value between 0 (completely different) and 1 (identical).
 */
export function cosineSimilarity(first: string[], second: string[]): number {
    if (first.length === 0 || second.length === 0) {
        return 0;
    }

    // 1. Helper function to calculate Term Frequencies (TF)
    const getTermFrequencies = (arr: string[]): Map<string, number> => {
        const frequencies = new Map<string, number>();
        for (const word of arr) {
            frequencies.set(word, (frequencies.get(word) || 0) + 1);
        }
        return frequencies;
    };

    const tfA = getTermFrequencies(first);
    const tfB = getTermFrequencies(second);

    // 2. Create a unique dictionary combining terms from both sets
    const allUniqueWords = new Set([...tfA.keys(), ...tfB.keys()]);

    let dotProduct = 0;
    let magnitudeASquared = 0;
    let magnitudeBSquared = 0;

    // 3. Compute vector space metrics in a single pass
    for (const word of allUniqueWords) {
        const countA = tfA.get(word) || 0;
        const countB = tfB.get(word) || 0;

        dotProduct += countA * countB;
        magnitudeASquared += countA * countA;
        magnitudeBSquared += countB * countB;
    }

    const magnitudeA = Math.sqrt(magnitudeASquared);
    const magnitudeB = Math.sqrt(magnitudeBSquared);

    // 4. Prevent division by zero error
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}
