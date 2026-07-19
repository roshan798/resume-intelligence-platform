import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { SetJobDescriptionStatusService } from "@/modules/job-descriptions/services/set-job-description-status.service";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const updated = await new SetJobDescriptionStatusService().execute(
        id,
        session.user.id,
        "ARCHIVED",
    );
    return updated
        ? NextResponse.json({ id, status: "ARCHIVED" })
        : NextResponse.json(
              { message: "Job description not found." },
              { status: 404 },
          );
}
