import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { GenerateSummaryService } from "@/modules/ai/services/generate-summary.service";

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const service = new GenerateSummaryService();

    const result = await service.execute(
        {
            jd: body.jd,
            resume: body.resume,
        },
        session.user.id,
    );

    return NextResponse.json(result);
}
