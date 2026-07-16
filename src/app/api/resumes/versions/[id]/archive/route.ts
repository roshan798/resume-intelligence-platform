import { NextResponse } from "next/server";

import { ArchiveVersionService } from "@/modules/resumes/services/archive-version.service";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}
export async function POST(request: Request, context: RouteContext) {
    const service = new ArchiveVersionService();
    const { id } = await context.params;
    const result = await service.execute(id);

    return NextResponse.json(result);
}
