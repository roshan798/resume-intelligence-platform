import { NextResponse } from "next/server";

import { GetKanbanBoardService } from "@/modules/applications/services/get-kanban-board.service";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const service = new GetKanbanBoardService();

    const result = await service.execute(userId);

    return NextResponse.json(result);
}
