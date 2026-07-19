import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
    const startedAt = Date.now();
    try {
        await prisma.$queryRaw`SELECT 1`;
        const jobs = await prisma.backgroundJob.groupBy({
            by: ["status"],
            where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
            _count: { id: true },
        });
        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            responseTimeMs: Date.now() - startedAt,
            checks: { database: "ok", backgroundJobs24h: Object.fromEntries(jobs.map((item) => [item.status, item._count.id])) },
        });
    } catch {
        return NextResponse.json({ status: "degraded", timestamp: new Date().toISOString(), checks: { database: "error" } }, { status: 503 });
    }
}
