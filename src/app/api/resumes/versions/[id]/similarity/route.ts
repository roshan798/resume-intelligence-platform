import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { GetVersionSimilarityService } from "@/modules/resumes/services/get-version-similarity.service";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(_request: Request, context: RouteContext) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const service = new GetVersionSimilarityService();
    const analysis = await service.execute(id, session.user.id);

    if (!analysis) {
        return NextResponse.json(
            { message: "Resume version not found." },
            { status: 404 },
        );
    }

    return NextResponse.json(analysis, {
        headers: {
            "Cache-Control": "private, no-store",
        },
    });
}
