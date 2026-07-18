import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { FinalizeVersionService } from "@/modules/resumes/services/finalize-version.service";
interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}
export async function POST(request: Request, context: RouteContext) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const service = new FinalizeVersionService();
    const { id } = await context.params;

    const result = await service.execute(id, session.user.id);

    if (!result) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
}
