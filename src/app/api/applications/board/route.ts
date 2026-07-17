import { NextResponse } from "next/server";

import { GetKanbanBoardService } from "@/modules/applications/services/get-kanban-board.service";

export async function GET() {
    const userId = "mock-user-id";

    const service = new GetKanbanBoardService();

    const result = await service.execute(userId);

    return NextResponse.json(result);
}
