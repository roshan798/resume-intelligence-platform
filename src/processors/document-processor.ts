import "dotenv/config";

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { z } from "zod";

import { PdfResumeParser } from "@/lib/parsing/parsers/pdf.parser";
import {
    CompileLatexPreviewService,
    LatexPreviewError,
} from "@/modules/resumes/services/compile-latex-preview.service";

const host = process.env.PROCESSOR_HOST ?? "127.0.0.1";
const port = Number(process.env.PROCESSOR_PORT ?? 3001);
const maxBodyBytes = 10 * 1024 * 1024;

const latexSchema = z.object({
    latexSource: z.string().min(1).max(500_000),
    latexStyleSource: z.string().max(500_000).nullable(),
    latexStyleFilename: z.string().max(255).nullable(),
});

const server = createServer(async (request, response) => {
    setSecurityHeaders(response);

    try {
        if (request.method === "GET" && request.url === "/health") {
            return sendJson(response, 200, { status: "ok" });
        }
        if (
            request.method === "POST" &&
            request.url === "/api/internal/documents/parse"
        ) {
            return await parsePdf(request, response);
        }
        if (
            request.method === "POST" &&
            request.url === "/api/internal/latex/compile"
        ) {
            return await compileLatex(request, response);
        }
        return sendJson(response, 404, { message: "Not found" });
    } catch (error) {
        console.error("Document processor request failed", error);
        return sendJson(response, 500, {
            message:
                error instanceof Error
                    ? error.message
                    : "Document processing failed.",
        });
    }
});

server.listen(port, host, () => {
    console.info(`Document processor listening on http://${host}:${port}`);
});

async function parsePdf(
    request: IncomingMessage,
    response: ServerResponse,
) {
    if (!isAuthorized(request, process.env.DOCUMENT_PROCESSOR_TOKEN)) {
        return sendJson(response, 401, { message: "Unauthorized" });
    }
    if (!request.headers["content-type"]?.startsWith("application/pdf")) {
        return sendJson(response, 415, {
            message: "Only application/pdf is supported.",
        });
    }
    const buffer = await readBody(request);
    const parsed = await new PdfResumeParser(false).parse(buffer);
    return sendJson(response, 200, { rawText: parsed.rawText });
}

async function compileLatex(
    request: IncomingMessage,
    response: ServerResponse,
) {
    if (!isAuthorized(request, process.env.LATEX_COMPILER_TOKEN)) {
        return sendJson(response, 401, { message: "Unauthorized" });
    }
    const parsed = latexSchema.safeParse(
        JSON.parse((await readBody(request)).toString("utf8")),
    );
    if (!parsed.success) {
        return sendJson(response, 400, {
            message: "Invalid LaTeX compilation request.",
        });
    }

    try {
        const pdf = await new CompileLatexPreviewService().compileSource(
            parsed.data,
        );
        response.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Length": pdf.length,
            "Cache-Control": "no-store",
        });
        response.end(pdf);
    } catch (error) {
        return sendJson(response, 422, {
            message:
                error instanceof LatexPreviewError
                    ? error.message
                    : "Unable to compile LaTeX.",
        });
    }
}

function isAuthorized(request: IncomingMessage, token: string | undefined) {
    return Boolean(
        token && request.headers.authorization === `Bearer ${token}`,
    );
}

async function readBody(request: IncomingMessage): Promise<Buffer> {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of request) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.length;
        if (size > maxBodyBytes) {
            throw new Error("Request body exceeds the 10MB processor limit.");
        }
        chunks.push(buffer);
    }
    if (size === 0) throw new Error("Request body is empty.");
    return Buffer.concat(chunks);
}

function sendJson(
    response: ServerResponse,
    status: number,
    body: Record<string, unknown>,
) {
    const json = JSON.stringify(body);
    response.writeHead(status, {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(json),
    });
    response.end(json);
}

function setSecurityHeaders(response: ServerResponse) {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "no-store");
}

function shutdown(signal: string) {
    console.info(`Received ${signal}; stopping document processor`);
    server.close(() => process.exit(0));
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
