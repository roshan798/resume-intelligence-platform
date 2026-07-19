import { PDFParse } from "pdf-parse";

import { ResumeParser } from "./parser.interface";

import { ParsedResume } from "../types";

export class PdfResumeParser implements ResumeParser {
    async parse(fileBuffer: Buffer): Promise<ParsedResume> {
        const parser = new PDFParse({ data: fileBuffer });

        try {
            const result = await parser.getText();

            return {
                rawText: result.text,
                sections: {
                    summary: "",
                    skills: "",
                    experience: [],
                    projects: [],
                    education: [],
                    certifications: [],
                    others: [],
                },
                sourceFormat: "PDF",
            };
        } finally {
            await parser.destroy();
        }
    }
}
