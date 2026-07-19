import { KeywordExtractor } from "@/lib/parsing/keywords/extractor";

import { determineImportance } from "../scoring/keyword-importance";

import { JDSectionizer, type JDSectionName } from "./jd-sectionizer";
import type { JDKeyword, JDRequirement, ParsedJD } from "./jd-types";

const requirementRank: Record<JDRequirement, number> = {
    REQUIRED: 3,
    PREFERRED: 2,
    CONTEXT: 1,
};

export class JDParserService {
    parse(rawText: string): ParsedJD {
        const sections = new JDSectionizer().extract(rawText);
        const extractor = new KeywordExtractor();
        const merged = new Map<string, JDKeyword>();

        for (const [sectionName, text] of Object.entries(sections) as Array<
            [JDSectionName, string]
        >) {
            for (const extracted of extractor.extractDetailed(text)) {
                const requirement = this.classifyRequirement(
                    sectionName,
                    extracted.evidence,
                );
                const current = merged.get(extracted.normalizedKeyword);

                if (!current) {
                    merged.set(extracted.normalizedKeyword, {
                        keyword: extracted.normalizedKeyword,
                        displayName: extracted.keyword,
                        normalizedKeyword: extracted.normalizedKeyword,
                        category: extracted.category,
                        requirement,
                        importance: determineImportance(sectionName),
                        sourceSection: sectionName,
                        sourceSections: [sectionName],
                        occurrences: extracted.occurrences,
                        evidence: extracted.evidence,
                    });
                    continue;
                }

                current.occurrences += extracted.occurrences;
                current.evidence = [...new Set([...current.evidence, ...extracted.evidence])].slice(0, 5);
                if (!current.sourceSections.includes(sectionName)) {
                    current.sourceSections.push(sectionName);
                }

                if (requirementRank[requirement] > requirementRank[current.requirement]) {
                    current.requirement = requirement;
                    current.importance = determineImportance(sectionName);
                    current.sourceSection = sectionName;
                }
            }
        }

        const keywords = [...merged.values()].sort(
            (left, right) =>
                requirementRank[right.requirement] - requirementRank[left.requirement] ||
                left.category.localeCompare(right.category) ||
                left.displayName.localeCompare(right.displayName),
        );

        return { rawText, sections, keywords };
    }

    private classifyRequirement(
        section: JDSectionName,
        evidence: string[],
    ): JDRequirement {
        const context = evidence.join(" ");

        if (
            section === "preferred" ||
            /\b(?:preferred|nice to have|good to have|bonus|major plus|advantage|familiarity)\b/iu.test(context)
        ) {
            return "PREFERRED";
        }

        if (
            section === "requirements" ||
            /\b(?:must|required|hands-on|commercial experience|deep understanding|solid experience|proficien(?:t|cy)|strong)\b/iu.test(context)
        ) {
            return "REQUIRED";
        }

        return "CONTEXT";
    }
}
