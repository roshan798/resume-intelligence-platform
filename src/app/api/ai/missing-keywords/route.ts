import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { GenerateMissingKeywordsService } from "@/modules/ai/services/generate-missing-keywords.service";
const schema = z.object({ resumeText: z.string().min(1).max(30_000), missingKeywords: z.array(z.string().min(1).max(100)).min(1).max(100) });

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: "Resume text and a valid keyword list are required." }, { status: 422 });

    const service = new GenerateMissingKeywordsService();

    const result = await service.execute(
        {
            resumeText: parsed.data.resumeText,
            missingKeywords: parsed.data.missingKeywords,
        },
        session.user.id,
    );

    return NextResponse.json(result);
}
