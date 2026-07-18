// src/app/api/resumes/versions/[id]/fork/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ForkVersionService } from "@/modules/resumes/services/fork-version.service";

export async function POST(
    request: Request,
    context: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Optional: Parse jdSnapshotId from request body if you plan to support it later
    let jdSnapshotId: string | undefined;
    try {
        const body = await request.json();
        jdSnapshotId = body.jdSnapshotId;
    } catch {
        // Safe to ignore if no body payload is provided
    }

    const service = new ForkVersionService();

    // Fix: Pass 'id' directly as a string instead of wrapping it in an object
    const version = await service.execute(id, session.user.id, jdSnapshotId);

    return NextResponse.json(version);
}
