export interface JDKeyword {
    keyword: string;
    importance: number;
    sourceSection:
        | "requirements"
        | "responsibilities"
        | "preferred"
        | "general";
}

export interface ParsedJD {
    rawText: string;

    keywords: JDKeyword[];

    sections: {
        requirements: string;
        responsibilities: string;
        preferred: string;
        general: string;
    };
}
