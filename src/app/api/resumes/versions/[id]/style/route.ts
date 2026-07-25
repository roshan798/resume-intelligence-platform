import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { ReplaceLatexClassService } from "@/modules/resumes/services/replace-latex-class.service";
import { validateLatexStyleFile } from "@/modules/resumes/validations/upload-resume.schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> },
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!(file instanceof File)) {
            return NextResponse.json(
                { message: "Select a complete .cls file." },
                { status: 400 },
            );
        }
        validateLatexStyleFile(file);
        const buffer = Buffer.from(await file.arrayBuffer());
        if (buffer.includes(0)) {
            return NextResponse.json(
                { message: "The .cls file must contain text only." },
                { status: 400 },
            );
        }

        const result = await new ReplaceLatexClassService().execute({
            versionId: id,
            userId: session.user.id,
            filename: file.name,
            source: buffer.toString("utf8"),
        });
        if (!result) {
            return NextResponse.json(
                { message: "Resume version not found." },
                { status: 404 },
            );
        }
        return NextResponse.json(result);
    } catch (error) {
        logger.error(
            { err: error, versionId: id, userId: session.user.id },
            "Failed to replace LaTeX class file",
        );
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to replace the LaTeX class file.",
            },
            { status: 422 },
        );
    }
}
