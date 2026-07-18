import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { UpdateApplicationStatusService } from "@/modules/applications/services/update-application-status.service";

export async function PATCH(
    request: NextRequest,
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

    const body = await request.json();

    const service = new UpdateApplicationStatusService();

    const result = await service.execute(id, body.status, session.user.id);

    if (!result) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
}
