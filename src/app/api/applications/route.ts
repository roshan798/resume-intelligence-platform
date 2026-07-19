import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ApplicationService } from "@/modules/applications/services/application.service";
import { GetKanbanBoardService } from "@/modules/applications/services/get-kanban-board.service";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await new GetKanbanBoardService().execute(session.user.id));
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.matchResultId === "string") {
        const application = await new ApplicationService().createFromMatch(body.matchResultId, session.user.id);
        if (!application) return NextResponse.json({ message: "Match not found." }, { status: 404 });
        return NextResponse.json(application, { status: 201 });
    }

    if (typeof body.company !== "string" || !body.company.trim() || typeof body.roleTitle !== "string" || !body.roleTitle.trim() || typeof body.resumeVersionId !== "string") {
        return NextResponse.json({ message: "Company, role and resume version are required." }, { status: 422 });
    }

    const application = await new ApplicationService().createManual({
        userId: session.user.id,
        company: body.company.trim(),
        roleTitle: body.roleTitle.trim(),
        resumeVersionId: body.resumeVersionId,
        jdAnalysisId: typeof body.jdAnalysisId === "string" ? body.jdAnalysisId : null,
    });
    if (!application) return NextResponse.json({ message: "Resume version or job description not found." }, { status: 404 });
    return NextResponse.json(application, { status: 201 });
}
