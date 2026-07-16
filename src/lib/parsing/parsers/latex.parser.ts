import { ParsedResume } from "../types";

import { ResumeParser } from "./parser.interface";

export class LatexResumeParser implements ResumeParser {
    async parse(fileBuffer: Buffer): Promise<ParsedResume> {
        const text = fileBuffer.toString("utf8");

        const cleaned = text
            .replace(/\\textbf\{([^}]*)\}/g, "$1")
            .replace(/\\textit\{([^}]*)\}/g, "$1")
            .replace(/\\item/g, "")
            .replace(/\\[a-zA-Z]+\{[^}]*\}/g, "");

        return {
            rawText: cleaned,
            sections: {
                summary: "",
                skills: "",
                experience: [],
                projects: [],
                education: [],
                certifications: [],
                others: [],
            },
            sourceFormat: "LATEX",
        };
    }
}
