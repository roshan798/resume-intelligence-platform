import { SECTION_WEIGHTS } from "./section-weights";

export type KeywordRequirement = "REQUIRED" | "PREFERRED" | "CONTEXT";

export interface ScorableJDKeyword {
    keyword: string;
    importance: number;
    requirement?: KeywordRequirement;
}

export interface MatchSectionScores {
    requiredCoverage: number;
    preferredCoverage: number;
    contextCoverage: number;
    requiredMatched: number;
    requiredTotal: number;
    preferredMatched: number;
    preferredTotal: number;
    contextMatched: number;
    contextTotal: number;
}

export class ScoringService {
    score(
        jdKeywords: ScorableJDKeyword[],
        resumeKeywords: Record<string, string[]>,
    ) {
        let achieved = 0;
        let possible = 0;
        const matchedKeywords: string[] = [];
        const missingKeywords: string[] = [];
        const weakKeywords: string[] = [];
        const totals: Record<KeywordRequirement, number> = {
            REQUIRED: 0,
            PREFERRED: 0,
            CONTEXT: 0,
        };
        const matches: Record<KeywordRequirement, number> = {
            REQUIRED: 0,
            PREFERRED: 0,
            CONTEXT: 0,
        };

        for (const jdKeyword of jdKeywords) {
            const requirement = this.requirementFor(jdKeyword);
            const importance = Math.max(0, jdKeyword.importance);
            totals[requirement] += 1;
            possible += importance;

            const locations = resumeKeywords[jdKeyword.keyword];
            if (!Array.isArray(locations) || locations.length === 0) {
                missingKeywords.push(jdKeyword.keyword);
                continue;
            }

            matches[requirement] += 1;
            matchedKeywords.push(jdKeyword.keyword);
            const weight = Math.max(
                ...locations.map(
                    (location) =>
                        SECTION_WEIGHTS[
                            location as keyof typeof SECTION_WEIGHTS
                        ] ?? 0.1,
                ),
            );
            achieved += importance * weight;

            if (weight < 0.5) weakKeywords.push(jdKeyword.keyword);
        }

        const sectionScores: MatchSectionScores = {
            requiredCoverage: this.coverage(matches.REQUIRED, totals.REQUIRED),
            preferredCoverage: this.coverage(matches.PREFERRED, totals.PREFERRED),
            contextCoverage: this.coverage(matches.CONTEXT, totals.CONTEXT),
            requiredMatched: matches.REQUIRED,
            requiredTotal: totals.REQUIRED,
            preferredMatched: matches.PREFERRED,
            preferredTotal: totals.PREFERRED,
            contextMatched: matches.CONTEXT,
            contextTotal: totals.CONTEXT,
        };

        return {
            overallScore:
                possible > 0
                    ? Number(((achieved / possible) * 100).toFixed(2))
                    : 0,
            matchedKeywords,
            missingKeywords,
            weakKeywords,
            sectionScores,
        };
    }

    private requirementFor(keyword: ScorableJDKeyword): KeywordRequirement {
        if (keyword.requirement) return keyword.requirement;
        if (keyword.importance >= 5) return "REQUIRED";
        if (keyword.importance <= 1) return "PREFERRED";
        return "CONTEXT";
    }

    private coverage(matched: number, total: number): number {
        return total > 0 ? Number(((matched / total) * 100).toFixed(2)) : 0;
    }
}
