import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { AISuggestionService } from "@/modules/ai/services/ai-suggestion.service";

const requestSchema = z.object({ status: z.enum(["ACCEPTED", "REJECTED"]) });

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> },
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: "Invalid suggestion status." }, { status: 400 });
    const { id } = await context.params;
    const updated = await new AISuggestionService().updateStatus(id, session.user.id, parsed.data.status);
    if (!updated) return NextResponse.json({ message: "Suggestion not found." }, { status: 404 });
    return NextResponse.json({ status: parsed.data.status });
}
