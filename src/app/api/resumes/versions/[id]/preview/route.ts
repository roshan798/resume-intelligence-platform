import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { SupabaseStorage } from "@/lib/storage/supabase-storage";
import { ResumeVersionRepository } from "@/modules/resumes/repositories/resume-version.repository";
import {
    PreviewNotFoundError,
    PreviewUnsupportedError,
    PreviewVersionService,
} from "@/modules/resumes/services/preview-version.service";
import {
    CompileLatexPreviewService,
    LatexPreviewError,
} from "@/modules/resumes/services/compile-latex-preview.service";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(_request: Request, context: RouteContext) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    try {
        const latexPdf = await new CompileLatexPreviewService().execute(
            id,
            session.user.id,
        );
        if (latexPdf) {
            return new Response(new Uint8Array(latexPdf), {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": "inline; filename=resume-preview.pdf",
                    "Cache-Control": "private, no-store",
                    "X-Content-Type-Options": "nosniff",
                },
            });
        }
    } catch (error) {
        if (error instanceof LatexPreviewError) {
            return NextResponse.json({ message: error.message }, { status: 422 });
        }
        return NextResponse.json(
            { message: "Unable to compile the LaTeX preview." },
            { status: 502 },
        );
    }

    const service = new PreviewVersionService(
        new ResumeVersionRepository(),
        new SupabaseStorage(),
    );

    try {
        const signedUrl = await service.execute({
            versionId: id,
            userId: session.user.id,
        });

        const response = NextResponse.redirect(signedUrl, 307);
        response.headers.set("Cache-Control", "private, no-store");
        response.headers.set("X-Content-Type-Options", "nosniff");

        return response;
    } catch (error) {
        if (error instanceof PreviewNotFoundError) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }

        if (error instanceof PreviewUnsupportedError) {
            return NextResponse.json({ message: error.message }, { status: 415 });
        }

        return NextResponse.json(
            { message: "Unable to create a secure PDF preview." },
            { status: 502 },
        );
    }
}
