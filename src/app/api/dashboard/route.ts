import { NextResponse } from "next/server";
import { DashboardService } from "@/modules/dashboard/services/dashboard.service";

const service = new DashboardService();

export async function GET() {
    /**
     * Replace with authenticated user later.
     */
    const userId = "demo-user-id";

    const dashboard = await service.execute(userId);

    return NextResponse.json(dashboard);
}