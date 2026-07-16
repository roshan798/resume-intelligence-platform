import { skillTaxonomy } from "./taxonomy";

export class KeywordExtractor {
    extract(text: string) {
        const lower = text.toLowerCase();

        const found = new Set<string>();

        for (const [canonical, aliases] of Object.entries(skillTaxonomy)) {
            const matched = aliases.some((alias) => lower.includes(alias));

            if (matched) {
                found.add(canonical);
            }
        }

        return [...found];
    }
}
