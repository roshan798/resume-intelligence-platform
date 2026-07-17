import { NextRequest, NextResponse } from "next/server";

import { RecommendResumeService } from "@/modules/search/services/recommend-resume.service";

export async function POST(request: NextRequest) {
    const body = await request.json();

    const service = new RecommendResumeService();

    const result = await service.execute(body.jdText);

    return NextResponse.json(result);
}
