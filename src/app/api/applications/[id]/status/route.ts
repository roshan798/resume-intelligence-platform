import { NextRequest, NextResponse } from "next/server";

import { UpdateApplicationStatusService } from "@/modules/applications/services/update-application-status.service";

export async function PATCH(
    request: NextRequest,
    context: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    const { id } = await context.params;

    const body = await request.json();

    const service = new UpdateApplicationStatusService();

    const result = await service.execute(id, body.status);

    return NextResponse.json(result);
}
