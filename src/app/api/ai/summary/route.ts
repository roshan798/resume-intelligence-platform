import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { GenerateSummaryService } from "@/modules/ai/services/generate-summary.service";
const schema = z.object({ jd: z.string().min(1).max(30_000), resume: z.string().min(1).max(30_000) });

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: "JD and resume text are required and must be under 30,000 characters." }, { status: 422 });

    const service = new GenerateSummaryService();

    const result = await service.execute(
        {
            jd: parsed.data.jd,
            resume: parsed.data.resume,
        },
        session.user.id,
    );

    return NextResponse.json(result);
}
