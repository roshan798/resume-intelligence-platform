import { NextResponse } from "next/server";

import { GetDashboardStatsService } from "@/modules/dashboard/services/get-dashboard-stats.service";

export async function GET() {
    const userId = "mock-user-id";

    const service = new GetDashboardStatsService();

    const stats = await service.execute(userId);

    return NextResponse.json(stats);
}
