import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { RewriteBulletsService } from "@/modules/ai/services/rewrite-bullets.service";
const schema = z.object({ jd: z.string().min(1).max(30_000), bullets: z.array(z.string().min(1).max(2_000)).min(1).max(30) });

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: "A valid JD and 1-30 resume bullets are required." }, { status: 422 });

    const service = new RewriteBulletsService();

    const result = await service.execute(
        {
            jd: parsed.data.jd,
            bullets: parsed.data.bullets,
        },
        session.user.id,
    );

    return NextResponse.json(result);
}
