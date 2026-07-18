import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { MatchResultRepository } from "@/modules/match/repositories/match-result.repository";

// Define the type structure for the route configuration
interface RouteContext {
    params: Promise<{
        jdId: string;
    }>;
}

export async function GET(request: Request, context: RouteContext) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const repository = new MatchResultRepository();

    // Await the route parameter object before evaluating values
    const { jdId } = await context.params;
    const results = await repository.getByAnalysisAndUser(jdId, session.user.id);

    return NextResponse.json(results);
}
