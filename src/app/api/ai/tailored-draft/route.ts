import { NextRequest, NextResponse } from "next/server";
import { GenerateTailoredDraftService } from "@/modules/ai/services/generate-tailored-draft.service";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const service = new GenerateTailoredDraftService();

    const result = await service.execute({
        resume: body.resume,
        jd: body.jd,
    });

    return NextResponse.json(result);
}
