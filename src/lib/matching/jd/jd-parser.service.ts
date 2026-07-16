import { KeywordExtractor } from "@/lib/parsing/keywords/extractor";

import { determineImportance } from "../scoring/keyword-importance";

import { JDSectionizer } from "./jd-sectionizer";

export class JDParserService {
    parse(rawText: string) {
        const sectionizer = new JDSectionizer();

        const sections = sectionizer.extract(rawText);

        const extractor = new KeywordExtractor();

        const keywords = [];

        for (const [sectionName, text] of Object.entries(sections)) {
            const extracted = extractor.extract(text);

            for (const keyword of extracted) {
                keywords.push({
                    keyword,
                    importance: determineImportance(sectionName as never),
                    sourceSection: sectionName,
                });
            }
        }

        return {
            rawText,
            sections,
            keywords,
        };
    }
}
