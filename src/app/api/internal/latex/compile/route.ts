import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import {
    CompileLatexPreviewService,
    LatexPreviewError,
} from "@/modules/resumes/services/compile-latex-preview.service";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
    latexSource: z.string().min(1).max(500_000),
    latexStyleSource: z.string().max(500_000).nullable(),
    latexStyleFilename: z.string().max(255).nullable(),
});

export async function POST(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json(
            { message: "Invalid LaTeX compilation request." },
            { status: 400 },
        );
    }

    try {
        const pdf = await new CompileLatexPreviewService().compileSource(
            parsed.data,
        );
        return new Response(new Uint8Array(pdf), {
            headers: {
                "Content-Type": "application/pdf",
                "Cache-Control": "no-store",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        logger.error({ err: error }, "Internal LaTeX compilation failed");
        return NextResponse.json(
            {
                message:
                    error instanceof LatexPreviewError
                        ? error.message
                        : "Unable to compile LaTeX.",
            },
            { status: 422 },
        );
    }
}

function isAuthorized(request: Request): boolean {
    const token = process.env.LATEX_COMPILER_TOKEN;
    return Boolean(
        token && request.headers.get("authorization") === `Bearer ${token}`,
    );
}
