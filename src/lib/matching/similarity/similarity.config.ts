export const RESUME_SIMILARITY_THRESHOLDS = {
    nearDuplicate: 92,
    highSimilarity: 80,
    moderateSimilarity: 55,
} as const;

export const RESUME_SIMILARITY_WEIGHTS = {
    tokenSetJaccard: 0.35,
    termFrequencyCosine: 0.45,
    wordBigramJaccard: 0.2,
} as const;
