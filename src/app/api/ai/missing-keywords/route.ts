import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { GenerateMissingKeywordsService } from "@/modules/ai/services/generate-missing-keywords.service";

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const service = new GenerateMissingKeywordsService();

    const result = await service.execute(
        {
            resumeText: body.resumeText,
            missingKeywords: body.missingKeywords,
        },
        session.user.id,
    );

    return NextResponse.json(result);
}
