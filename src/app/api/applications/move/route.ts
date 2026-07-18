import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { MoveApplicationService } from "@/modules/applications/services/move-application.service";

export async function PATCH(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const service = new MoveApplicationService();

    const result = await service.execute(
        body.applicationId,
        body.targetStatus,
        session.user.id,
    );

    if (!result) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
}
