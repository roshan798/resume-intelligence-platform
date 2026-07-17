import { NextRequest, NextResponse } from "next/server";

import { GenerateSummaryService } from "@/modules/ai/services/generate-summary.service";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const service = new GenerateSummaryService();

    const result = await service.execute({
        jd: body.jd,
        resume: body.resume,
    });

    return NextResponse.json(result);
}
