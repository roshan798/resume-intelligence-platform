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
    constructor(private readonly allowRemote = true) {}

    async parse(fileBuffer: Buffer): Promise<ParsedResume> {
        logger.info(
            { bufferSize: fileBuffer.byteLength },
            "Starting PDF parsing execution",
        );

        if (this.allowRemote && process.env.DOCUMENT_PROCESSOR_URL) {
            return this.parseRemotely(fileBuffer);
        }

        // PDF.js uses these browser primitives even for text-only extraction.
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

    private async parseRemotely(fileBuffer: Buffer): Promise<ParsedResume> {
        const baseUrl = process.env.DOCUMENT_PROCESSOR_URL?.replace(/\/$/u, "");
        const token = process.env.DOCUMENT_PROCESSOR_TOKEN;
        if (!baseUrl || !token) {
            throw new Error(
                "DOCUMENT_PROCESSOR_TOKEN is required when DOCUMENT_PROCESSOR_URL is configured.",
            );
        }

        const response = await fetch(`${baseUrl}/api/internal/documents/parse`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/pdf",
            },
            body: new Uint8Array(fileBuffer),
            signal: AbortSignal.timeout(45_000),
        });
        const result = (await response.json()) as {
            rawText?: string;
            message?: string;
        };
        if (!response.ok || typeof result.rawText !== "string") {
            throw new Error(
                result.message || `Document processor returned HTTP ${response.status}.`,
            );
        }

        logger.info(
            { textLength: result.rawText.length },
            "PDF parsed by remote document processor",
        );
        return {
            rawText: result.rawText,
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
    }
}
