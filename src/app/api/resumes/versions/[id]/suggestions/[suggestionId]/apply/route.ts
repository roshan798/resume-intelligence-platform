import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { ApplyLatexSuggestionService } from "@/modules/ai/services/apply-latex-suggestion.service";

export async function POST(
    _request: Request,
    context: { params: Promise<{ id: string; suggestionId: string }> },
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id, suggestionId } = await context.params;
    try {
        const version = await new ApplyLatexSuggestionService().execute(suggestionId, id, session.user.id);
        if (!version) return NextResponse.json({ message: "Suggestion or draft not found." }, { status: 404 });
        return NextResponse.json({ id: version.id, status: "APPLIED" });
    } catch (error) {
        logger.error(
            {
                err: error,
                draftVersionId: id,
                suggestionId,
                userId: session.user.id,
            },
            "Failed to apply AI suggestion to LaTeX draft",
        );
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Unable to apply suggestion." },
            { status: 422 },
        );
    }
}
