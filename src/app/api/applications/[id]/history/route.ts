import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { GetApplicationHistoryService } from "@/modules/applications/services/get-application-history.service";

export async function GET(
    _request: Request,
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

    const service = new GetApplicationHistoryService();

    const history = await service.execute(id, session.user.id);

    if (!history) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(history);
}
