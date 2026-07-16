import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    context: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    const params = await context.params;

    const versions = await prisma.resumeVersion.findMany({
        where: {
            resumeId: params.id,
        },

        orderBy: {
            versionNumber: "desc",
        },
    });

    return NextResponse.json(versions);
}
