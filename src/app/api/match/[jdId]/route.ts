import { NextResponse } from "next/server";
import { MatchResultRepository } from "@/modules/match/repositories/match-result.repository";

// Define the type structure for the route configuration
interface RouteContext {
    params: Promise<{
        jdId: string;
    }>;
}

export async function GET(request: Request, context: RouteContext) {
    const repository = new MatchResultRepository();

    // Await the route parameter object before evaluating values
    const { jdId } = await context.params;
    const results = await repository.getByAnalysis(jdId);

    return NextResponse.json(results);
}
