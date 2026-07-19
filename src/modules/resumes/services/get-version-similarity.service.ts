import { ResumeSimilarityService } from "@/lib/matching/similarity/resume-similarity.service";
import { ResumeVersionRepository } from "@/modules/resumes/repositories/resume-version.repository";

export interface VersionSimilarityComparison {
    versionId: string;
    resumeId: string;
    resumeTitle: string;
    versionNumber: number;
    score: number;
    classification:
        | "EXACT_DUPLICATE"
        | "NEAR_DUPLICATE"
        | "HIGH_SIMILARITY"
        | "MODERATE_SIMILARITY"
        | "LOW_SIMILARITY";
    exactDuplicate: boolean;
    sameResumeLineage: boolean;
    metrics: {
        tokenSetJaccard: number;
        termFrequencyCosine: number;
        wordBigramJaccard: number;
    };
    explanation: string[];
}

export interface VersionSimilarityAnalysis {
    status: "READY" | "INSUFFICIENT_TEXT" | "NO_COMPARABLE_VERSIONS";
    fingerprintHash: string | null;
    mostSimilar: VersionSimilarityComparison | null;
    comparisons: VersionSimilarityComparison[];
}

export class GetVersionSimilarityService {
    private readonly repository = new ResumeVersionRepository();
    private readonly similarity = new ResumeSimilarityService();

    async execute(
        versionId: string,
        userId: string,
    ): Promise<VersionSimilarityAnalysis | null> {
        const target = await this.repository.findSimilarityTarget(
            versionId,
            userId,
        );

        if (!target) return null;

        if (!target.rawText.trim()) {
            return {
                status: "INSUFFICIENT_TEXT",
                fingerprintHash: null,
                mostSimilar: null,
                comparisons: [],
            };
        }

        const candidates = await this.repository.findSimilarityCandidates(
            versionId,
            userId,
        );
        const comparisons = candidates
            .map((candidate): VersionSimilarityComparison => {
                const result = this.similarity.compare(
                    target.rawText,
                    candidate.rawText,
                );
                const sameResumeLineage = target.resumeId === candidate.resumeId;
                const explanation = [...result.explanation];

                if (sameResumeLineage) {
                    explanation.push(
                        "These versions belong to the same resume lineage, so high similarity is expected and is not treated as an accidental upload duplicate.",
                    );
                }

                return {
                    versionId: candidate.id,
                    resumeId: candidate.resumeId,
                    resumeTitle: candidate.resume.title,
                    versionNumber: candidate.versionNumber,
                    score: result.score,
                    classification: result.classification,
                    exactDuplicate: result.exactDuplicate,
                    sameResumeLineage,
                    metrics: result.metrics,
                    explanation,
                };
            })
            .sort((first, second) => second.score - first.score);

        return {
            status:
                comparisons.length > 0 ? "READY" : "NO_COMPARABLE_VERSIONS",
            fingerprintHash: this.similarity.createFingerprint(target.rawText),
            mostSimilar: comparisons[0] ?? null,
            comparisons: comparisons.slice(0, 5),
        };
    }
}
