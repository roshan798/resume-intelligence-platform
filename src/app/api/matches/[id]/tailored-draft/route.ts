import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { CreateTailoredDraftFromMatchService } from "@/modules/resumes/services/create-tailored-draft-from-match.service";

export async function POST(
    _request: Request,
    context: { params: Promise<{ id: string }> },
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;

    try {
        const draft = await new CreateTailoredDraftFromMatchService().execute(id, session.user.id);
        if (!draft) return NextResponse.json({ message: "Match result not found." }, { status: 404 });
        return NextResponse.json({ id: draft.id, resumeId: draft.resumeId });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Unable to create tailored draft." },
            { status: 422 },
        );
    }
}
