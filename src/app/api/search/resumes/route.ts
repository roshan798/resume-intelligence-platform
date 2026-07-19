import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { SearchSimilarResumesService } from "@/modules/search/services/search-similar-resumes.service";
import { z } from "zod";

const requestSchema = z.object({ query: z.string().trim().min(3).max(12000) });

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: "Enter at least 3 characters." }, { status: 400 });
    try {
        return NextResponse.json(await new SearchSimilarResumesService().execute(parsed.data.query, session.user.id));
    } catch (error) {
        return NextResponse.json({ message: error instanceof Error ? error.message : "Semantic search failed." }, { status: 422 });
    }
}
