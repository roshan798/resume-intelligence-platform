import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { GenerateTailoredDraftService } from "@/modules/ai/services/generate-tailored-draft.service";

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const service = new GenerateTailoredDraftService();

    const result = await service.execute(
        {
            resume: body.resume,
            jd: body.jd,
        },
        session.user.id,
    );

    return NextResponse.json(result);
}
