import { SECTION_WEIGHTS } from "./section-weights";

export class ScoringService {
    score(
        jdKeywords: {
            keyword: string;
            importance: number;
        }[],

        resumeKeywords: Record<string, string[]>,
    ) {
        let achieved = 0;

        let possible = 0;

        const matched = [];
        const missing = [];
        const weak = [];

        for (const jdKeyword of jdKeywords) {
            possible += jdKeyword.importance;

            const locations = resumeKeywords[jdKeyword.keyword];

            if (!locations) {
                missing.push(jdKeyword.keyword);

                continue;
            }

            const weight = Math.max(
                ...locations.map(
                    (location) =>
                        SECTION_WEIGHTS[
                            location as keyof typeof SECTION_WEIGHTS
                        ] ?? 0.1,
                ),
            );

            achieved += jdKeyword.importance * weight;

            matched.push(jdKeyword.keyword);

            if (weight < 0.5) {
                weak.push(jdKeyword.keyword);
            }
        }

        return {
            overallScore: Number(((achieved / possible) * 100).toFixed(2)),

            matchedKeywords: matched,

            missingKeywords: missing,

            weakKeywords: weak,
        };
    }
}
