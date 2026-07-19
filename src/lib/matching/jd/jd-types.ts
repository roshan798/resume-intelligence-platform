import type { KeywordCategory } from "@/lib/parsing/keywords/taxonomy";

import type { JDSectionName, JDSections } from "./jd-sectionizer";

export type JDRequirement = "REQUIRED" | "PREFERRED" | "CONTEXT";

export interface JDKeyword {
    [key: string]: string | number | string[];
    /** Normalized identifier retained for matching-engine compatibility. */
    keyword: string;
    displayName: string;
    normalizedKeyword: string;
    category: KeywordCategory;
    requirement: JDRequirement;
    importance: number;
    sourceSection: JDSectionName;
    sourceSections: JDSectionName[];
    occurrences: number;
    evidence: string[];
}

export interface ParsedJD {
    rawText: string;
    keywords: JDKeyword[];
    sections: JDSections;
}
