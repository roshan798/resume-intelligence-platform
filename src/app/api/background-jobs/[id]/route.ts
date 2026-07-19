import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { GetJobService } from "@/modules/background-jobs/services/get-job.service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    try {
        return NextResponse.json(await new GetJobService().execute(id, session.user.id));
    } catch {
        return NextResponse.json({ message: "Background job not found." }, { status: 404 });
    }
}
