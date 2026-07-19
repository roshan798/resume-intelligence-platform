import { PdfResumeParser } from "../parsers/pdf.parser";

import { DocxResumeParser } from "../parsers/docx.parser";

import { LatexResumeParser } from "../parsers/latex.parser";

import { ResumeSectionizer } from "../sectionizer/sectionizer";

import { KeywordExtractor } from "../keywords/extractor";

export class ResumeParserService {
    async parse(
        sourceFormat: "PDF" | "DOCX" | "LATEX",

        buffer: Buffer,
    ) {
        const parser = this.getParser(sourceFormat);

        const parsed = await parser.parse(buffer);

        const sectionizer = new ResumeSectionizer();

        parsed.sections = sectionizer.extract(parsed.rawText);

        const extractor = new KeywordExtractor();

        const canonicalKeywords: Record<string, string[]> = {};

        for (const [sectionName, sectionContent] of Object.entries(
            parsed.sections,
        )) {
            const text = Array.isArray(sectionContent)
                ? sectionContent.join("\n")
                : sectionContent;

            for (const keyword of extractor.extract(text)) {
                canonicalKeywords[keyword] = [
                    ...new Set([
                        ...(canonicalKeywords[keyword] ?? []),
                        sectionName,
                    ]),
                ];
            }
        }

        return {
            parsedSections: parsed.sections,

            rawText: parsed.rawText,

            canonicalKeywords,
        };
    }

    private getParser(format: "PDF" | "DOCX" | "LATEX") {
        switch (format) {
            case "PDF":
                return new PdfResumeParser();

            case "DOCX":
                return new DocxResumeParser();

            case "LATEX":
                return new LatexResumeParser();

            default:
                throw new Error("Unsupported format");
        }
    }
}
