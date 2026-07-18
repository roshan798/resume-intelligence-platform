import { NextResponse } from "next/server";
import { DashboardService } from "@/modules/dashboard/services/dashboard.service";

const service = new DashboardService();

export async function GET() {
    const userId = "demo-user-id";

    const data = await service.execute(userId);

    return NextResponse.json(data);
}