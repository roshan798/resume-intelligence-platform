import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { CreateJobDescriptionSnapshotService } from "@/modules/job-descriptions/services/create-job-description-snapshot.service";
import { createJobDescriptionSnapshotSchema } from "@/modules/job-descriptions/validations/job-description.schema";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { message: "Request body must be valid JSON." },
            { status: 400 },
        );
    }

    const parsed = createJobDescriptionSnapshotSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { message: "Job description text must contain at least 50 characters." },
            { status: 400 },
        );
    }

    const { id } = await context.params;
    const service = new CreateJobDescriptionSnapshotService();
    const snapshot = await service.execute(
        id,
        session.user.id,
        parsed.data.rawText,
    );
    if (!snapshot) {
        return NextResponse.json(
            { message: "Job description not found." },
            { status: 404 },
        );
    }

    return NextResponse.json(snapshot, { status: 201 });
}
