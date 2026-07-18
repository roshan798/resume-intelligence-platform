import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
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

    const params = await context.params;

    const resume = await prisma.resume.findFirst({
        where: {
            id: params.id,
            userId: session.user.id,
        },
    });

    if (!resume) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

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
