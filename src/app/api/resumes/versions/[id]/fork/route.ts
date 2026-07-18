import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ForkVersionService } from "@/modules/resumes/services/fork-version.service";

// Define the route dynamic param contract configuration structure
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

    const service = new ForkVersionService();

    // Fix: Await the dynamic segment data context parameters object safely
    const { id } = await context.params;
    const result = await service.execute(id, session.user.id);

    if (!result) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
}
