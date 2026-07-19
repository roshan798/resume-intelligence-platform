import { createHash } from "node:crypto";

import { cosineSimilarity } from "./cosine-similarity";
import { jaccardSimilarity } from "./jaccard-similarity";
import {
    RESUME_SIMILARITY_THRESHOLDS,
    RESUME_SIMILARITY_WEIGHTS,
} from "./similarity.config";
import {
    createWordBigrams,
    normalizeResumeText,
    tokenizeNormalizedText,
} from "./resume-text-normalizer";

export type ResumeSimilarityClassification =
    | "EXACT_DUPLICATE"
    | "NEAR_DUPLICATE"
    | "HIGH_SIMILARITY"
    | "MODERATE_SIMILARITY"
    | "LOW_SIMILARITY";

export interface ResumeSimilarityResult {
    score: number;
    classification: ResumeSimilarityClassification;
    exactDuplicate: boolean;
    metrics: {
        tokenSetJaccard: number;
        termFrequencyCosine: number;
        wordBigramJaccard: number;
    };
    explanation: string[];
}

export class ResumeSimilarityService {
    compare(firstText: string, secondText: string): ResumeSimilarityResult {
        const firstNormalized = normalizeResumeText(firstText);
        const secondNormalized = normalizeResumeText(secondText);

        if (!firstNormalized || !secondNormalized) {
            return {
                score: 0,
                classification: "LOW_SIMILARITY",
                exactDuplicate: false,
                metrics: {
                    tokenSetJaccard: 0,
                    termFrequencyCosine: 0,
                    wordBigramJaccard: 0,
                },
                explanation: [
                    "Similarity could not be established because one or both versions contain no parsed text.",
                ],
            };
        }

        const exactDuplicate =
            this.hash(firstNormalized) === this.hash(secondNormalized);
        const firstTokens = tokenizeNormalizedText(firstNormalized);
        const secondTokens = tokenizeNormalizedText(secondNormalized);
        const metrics = {
            tokenSetJaccard: jaccardSimilarity(firstTokens, secondTokens),
            termFrequencyCosine: cosineSimilarity(firstTokens, secondTokens),
            wordBigramJaccard: jaccardSimilarity(
                createWordBigrams(firstTokens),
                createWordBigrams(secondTokens),
            ),
        };
        const weightedScore = exactDuplicate
            ? 100
            : (metrics.tokenSetJaccard *
                  RESUME_SIMILARITY_WEIGHTS.tokenSetJaccard +
                  metrics.termFrequencyCosine *
                      RESUME_SIMILARITY_WEIGHTS.termFrequencyCosine +
                  metrics.wordBigramJaccard *
                      RESUME_SIMILARITY_WEIGHTS.wordBigramJaccard) *
              100;
        const score = Number(weightedScore.toFixed(2));
        const classification = this.classify(score, exactDuplicate);

        return {
            score,
            classification,
            exactDuplicate,
            metrics: {
                tokenSetJaccard: this.asPercentage(metrics.tokenSetJaccard),
                termFrequencyCosine: this.asPercentage(
                    metrics.termFrequencyCosine,
                ),
                wordBigramJaccard: this.asPercentage(
                    metrics.wordBigramJaccard,
                ),
            },
            explanation: this.explain(classification, metrics),
        };
    }

    createFingerprint(text: string): string {
        return this.hash(normalizeResumeText(text));
    }

    private classify(
        score: number,
        exactDuplicate: boolean,
    ): ResumeSimilarityClassification {
        if (exactDuplicate) return "EXACT_DUPLICATE";
        if (score >= RESUME_SIMILARITY_THRESHOLDS.nearDuplicate) {
            return "NEAR_DUPLICATE";
        }
        if (score >= RESUME_SIMILARITY_THRESHOLDS.highSimilarity) {
            return "HIGH_SIMILARITY";
        }
        if (score >= RESUME_SIMILARITY_THRESHOLDS.moderateSimilarity) {
            return "MODERATE_SIMILARITY";
        }
        return "LOW_SIMILARITY";
    }

    private explain(
        classification: ResumeSimilarityClassification,
        metrics: {
            tokenSetJaccard: number;
            termFrequencyCosine: number;
            wordBigramJaccard: number;
        },
    ): string[] {
        if (classification === "EXACT_DUPLICATE") {
            return [
                "The normalized resume text is identical, including preserved technical terms and version numbers.",
            ];
        }

        const explanations = [
            `${this.asPercentage(metrics.tokenSetJaccard)}% of unique terms overlap.`,
            `${this.asPercentage(metrics.termFrequencyCosine)}% term-frequency similarity indicates comparable content emphasis.`,
            `${this.asPercentage(metrics.wordBigramJaccard)}% phrase-order overlap captures structural similarity.`,
        ];

        if (classification === "NEAR_DUPLICATE") {
            explanations.push(
                "Only small wording, formatting, or ordering changes separate these versions.",
            );
        } else if (classification === "HIGH_SIMILARITY") {
            explanations.push(
                "The versions share most content but contain meaningful edits.",
            );
        } else if (classification === "MODERATE_SIMILARITY") {
            explanations.push(
                "The versions share a common foundation with substantial differences.",
            );
        } else {
            explanations.push(
                "The versions differ substantially in content, emphasis, or structure.",
            );
        }

        return explanations;
    }

    private hash(value: string): string {
        return createHash("sha256").update(value).digest("hex");
    }

    private asPercentage(value: number): number {
        return Number((value * 100).toFixed(2));
    }
}
