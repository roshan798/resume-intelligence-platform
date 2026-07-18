import { NextResponse } from "next/server";
import { DashboardService } from "@/modules/dashboard/services/dashboard.service";
import { auth } from "@/auth";

const service = new DashboardService();

export async function GET() {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const data = await service.execute(userId);

    return NextResponse.json(data);
}