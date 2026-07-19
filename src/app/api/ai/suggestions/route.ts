import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { AISuggestionService } from "@/modules/ai/services/ai-suggestion.service";

const requestSchema = z.object({ matchResultId: z.uuid() });

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await new AISuggestionService().list(session.user.id));
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: "A valid match result is required." }, { status: 400 });

    try {
        const suggestion = await new AISuggestionService().generateFromMatch(
            parsed.data.matchResultId,
            session.user.id,
        );
        if (!suggestion) return NextResponse.json({ message: "Match result not found." }, { status: 404 });
        return NextResponse.json(suggestion, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Suggestion generation failed." },
            { status: 422 },
        );
    }
}
