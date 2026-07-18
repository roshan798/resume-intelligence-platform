import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { AnalyzeJDService } from "@/modules/jd/services/analyze-jd.service";

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const service = new AnalyzeJDService();
    const result = await service.execute(session.user.id, body);

    return NextResponse.json(result);
}
