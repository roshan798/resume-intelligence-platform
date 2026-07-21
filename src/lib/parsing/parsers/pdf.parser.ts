import { logger } from "@/lib/logger";
import { ResumeParser } from "./parser.interface";
import { ParsedResume } from "../types";

interface DestroyableParser {
    getText: () => Promise<{
        text: string;
        numpages?: number;
        pages?: unknown[];
    }>;
    destroy?: () => Promise<void>;
}

export class PdfResumeParser implements ResumeParser {
    async parse(fileBuffer: Buffer): Promise<ParsedResume> {
        logger.info(
            { bufferSize: fileBuffer.byteLength },
            "Starting PDF parsing execution",
        );

        // 1. Polyfill DOM Matrix & Canvas for Node environment
        if (typeof globalThis.DOMMatrix === "undefined") {
            try {
                const {
                    DOMMatrix,
                    ImageData,
                    Path2D,
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                } = require("@napi-rs/canvas");
                globalThis.DOMMatrix = DOMMatrix;
                globalThis.ImageData = ImageData;
                globalThis.Path2D = Path2D;
            } catch (canvasError) {
                logger.warn(
                    { err: canvasError },
                    "Failed to load @napi-rs/canvas; falling back to stub implementations",
                );
                // @ts-expect-error -- fallback stub for DOMMatrix in serverless
                globalThis.DOMMatrix = class DOMMatrix {};
                // @ts-expect-error -- fallback stub for ImageData in serverless
                globalThis.ImageData = class ImageData {};
                // @ts-expect-error -- fallback stub for Path2D in serverless
                globalThis.Path2D = class Path2D {};
            }
        }

        let parser: DestroyableParser | null = null;

        try {
            // 2. Set up PDF.js worker before loading pdf-parse
            const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

            // Point workerSrc to cdnjs fallback so Vercel doesn't crash on missing local worker.mjs
            if (pdfjs?.GlobalWorkerOptions) {
                pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
            }

            // 3. Load PDFParse
            const { PDFParse } = await import("pdf-parse");

            parser = new PDFParse({
                data: new Uint8Array(fileBuffer),
            }) as unknown as DestroyableParser;

            logger.info("Extracting text from PDF buffer");
            const result = await parser.getText();

            const extractedText = result.text || "";
            const pageCount = result.numpages ?? result.pages?.length ?? 0;

            logger.info(
                { textLength: extractedText.length, pageCount },
                "PDF text extraction completed successfully",
            );

            return {
                rawText: extractedText,
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
        } catch (error) {
            logger.error(
                { err: error, bufferSize: fileBuffer.byteLength },
                "Failed inside PdfResumeParser during text extraction",
            );
            throw error;
        } finally {
            if (parser && typeof parser.destroy === "function") {
                try {
                    await parser.destroy();
                } catch {}
            }
        }
    }
}
