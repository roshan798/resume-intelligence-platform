import { NextRequest, NextResponse } from "next/server";

import { RewriteBulletsService } from "@/modules/ai/services/rewrite-bullets.service";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const service = new RewriteBulletsService();

    const result = await service.execute({
        jd: body.jd,
        bullets: body.bullets,
    });

    return NextResponse.json(result);
}
