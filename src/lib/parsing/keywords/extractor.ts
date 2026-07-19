import { skillTaxonomy, type KeywordCategory } from "./taxonomy";

export interface ExtractedKeyword {
    keyword: string;
    normalizedKeyword: string;
    category: KeywordCategory;
    occurrences: number;
    evidence: string[];
}

export class KeywordExtractor {
    extract(text: string): string[] {
        return this.extractDetailed(text).map(
            (keyword) => keyword.normalizedKeyword,
        );
    }

    extractDetailed(text: string): ExtractedKeyword[] {
        const results: ExtractedKeyword[] = [];

        for (const taxonomyEntry of skillTaxonomy) {
            const evidence = new Set<string>();
            const occurrenceIndexes = new Set<number>();

            for (const alias of taxonomyEntry.aliases) {
                const expression = this.aliasExpression(alias);
                const matches = [...text.matchAll(expression)];

                for (const match of matches) {
                    const index = match.index ?? 0;
                    occurrenceIndexes.add(index);
                    evidence.add(this.extractEvidence(text, index));
                }
            }

            if (occurrenceIndexes.size > 0) {
                results.push({
                    keyword: taxonomyEntry.displayName,
                    normalizedKeyword: taxonomyEntry.normalizedKeyword,
                    category: taxonomyEntry.category,
                    occurrences: occurrenceIndexes.size,
                    evidence: [...evidence].filter(Boolean).slice(0, 3),
                });
            }
        }

        return results;
    }

    private aliasExpression(alias: string): RegExp {
        const escaped = alias
            .replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")
            .replace(/\s+/gu, "\\s+");

        return new RegExp(
            `(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`,
            "giu",
        );
    }

    private extractEvidence(text: string, index: number): string {
        const start = text.lastIndexOf("\n", index);
        const lineEnd = text.indexOf("\n", index);
        const end = lineEnd >= 0 ? lineEnd : text.length;

        return text
            .slice(start < 0 ? 0 : start + 1, end)
            .replace(/\s+/gu, " ")
            .trim()
            .slice(0, 240);
    }
}
