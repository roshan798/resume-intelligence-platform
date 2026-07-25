import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { PdfResumeParser } from "@/lib/parsing/parsers/pdf.parser";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!request.headers.get("content-type")?.startsWith("application/pdf")) {
        return NextResponse.json(
            { message: "Only application/pdf is supported." },
            { status: 415 },
        );
    }

    const buffer = Buffer.from(await request.arrayBuffer());
    if (buffer.length === 0 || buffer.length > 10 * 1024 * 1024) {
        return NextResponse.json(
            { message: "The PDF must be between 1 byte and 10MB." },
            { status: 413 },
        );
    }

    try {
        const parsed = await new PdfResumeParser(false).parse(buffer);
        return NextResponse.json({ rawText: parsed.rawText });
    } catch (error) {
        logger.error({ err: error }, "Document processor failed to parse PDF");
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to parse the PDF.",
            },
            { status: 422 },
        );
    }
}

function isAuthorized(request: Request): boolean {
    const token = process.env.DOCUMENT_PROCESSOR_TOKEN;
    return Boolean(
        token && request.headers.get("authorization") === `Bearer ${token}`,
    );
}
