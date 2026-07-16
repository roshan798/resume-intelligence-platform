import { jaccardSimilarity } from "./jaccard-similarity";

export class DuplicateDetectorService {
    private readonly threshold = 0.8;

    detect(
        currentKeywords: string[],
        existingResumes: {
            id: string;
            title: string;
            keywords: string[];
        }[],
    ) {
        const matches = [];

        for (const resume of existingResumes) {
            const similarity = jaccardSimilarity(
                currentKeywords,
                resume.keywords,
            );

            if (similarity >= this.threshold) {
                matches.push({
                    resumeId: resume.id,
                    title: resume.title,
                    similarity: Number((similarity * 100).toFixed(2)),
                });
            }
        }

        return matches.sort((a, b) => b.similarity - a.similarity);
    }
}
