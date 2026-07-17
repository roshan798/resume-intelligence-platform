import { NextResponse } from "next/server";

import { GetApplicationHistoryService } from "@/modules/applications/services/get-application-history.service";

export async function GET(
    _request: Request,
    context: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    const { id } = await context.params;

    const service = new GetApplicationHistoryService();

    const history = await service.execute(id);

    return NextResponse.json(history);
}
