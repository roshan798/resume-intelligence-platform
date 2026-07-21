if (typeof globalThis.DOMMatrix === "undefined") {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { DOMMatrix, ImageData, Path2D } = require("@napi-rs/canvas");
        globalThis.DOMMatrix = DOMMatrix;
        globalThis.ImageData = ImageData;
        globalThis.Path2D = Path2D;
    } catch {}
}
import { PDFParse } from "pdf-parse";

import { ResumeParser } from "./parser.interface";

import { ParsedResume } from "../types";

export class PdfResumeParser implements ResumeParser {
    async parse(fileBuffer: Buffer): Promise<ParsedResume> {
        const parser = new PDFParse({ data: new Uint8Array(fileBuffer) });

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
