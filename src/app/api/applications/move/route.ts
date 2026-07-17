import { NextRequest, NextResponse } from "next/server";

import { MoveApplicationService } from "@/modules/applications/services/move-application.service";

export async function PATCH(request: NextRequest) {
    const body = await request.json();

    const service = new MoveApplicationService();

    const result = await service.execute(body.applicationId, body.targetStatus);

    return NextResponse.json(result);
}
