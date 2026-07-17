import { NextRequest, NextResponse } from "next/server";

import { GenerateMissingKeywordsService } from "@/modules/ai/services/generate-missing-keywords.service";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const service = new GenerateMissingKeywordsService();

    const result = await service.execute({
        resumeText: body.resumeText,
        missingKeywords: body.missingKeywords,
    });

    return NextResponse.json(result);
}
