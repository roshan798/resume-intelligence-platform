import { NextResponse } from "next/server";

import { FinalizeVersionService } from "@/modules/resumes/services/finalize-version.service";
interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}
export async function POST(request: Request, context: RouteContext) {
    const service = new FinalizeVersionService();
    const { id } = await context.params;

    const result = await service.execute(id);

    return NextResponse.json(result);
}
