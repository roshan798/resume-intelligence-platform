export function jaccardSimilarity(first: string[], second: string[]): number {
    const setA = new Set(first);
    const setB = new Set(second);

    const intersection = [...setA].filter((value) => setB.has(value));

    const union = new Set([...setA, ...setB]);

    if (union.size === 0) {
        return 0;
    }

    return intersection.length / union.size;
}
