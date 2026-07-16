import { NextResponse } from "next/server";
import { ForkVersionService } from "@/modules/resumes/services/fork-version.service";

// Define the route dynamic param contract configuration structure
interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(request: Request, context: RouteContext) {
    const service = new ForkVersionService();

    // Fix: Await the dynamic segment data context parameters object safely
    const { id } = await context.params;
    const result = await service.execute(id);

    return NextResponse.json(result);
}
