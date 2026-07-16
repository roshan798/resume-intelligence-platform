import mammoth from "mammoth";

import { ParsedResume } from "../types";

import { ResumeParser } from "./parser.interface";

export class DocxResumeParser implements ResumeParser {
    async parse(fileBuffer: Buffer): Promise<ParsedResume> {
        const result = await mammoth.extractRawText({
            buffer: fileBuffer,
        });

        return {
            rawText: result.value,
            sections: {
                summary: "",
                skills: "",
                experience: [],
                projects: [],
                education: [],
                certifications: [],
                others: [],
            },
            sourceFormat: "DOCX",
        };
    }
}
