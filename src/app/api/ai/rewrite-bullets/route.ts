import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { RewriteBulletsService } from "@/modules/ai/services/rewrite-bullets.service";

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const service = new RewriteBulletsService();

    const result = await service.execute(
        {
            jd: body.jd,
            bullets: body.bullets,
        },
        session.user.id,
    );

    return NextResponse.json(result);
}
