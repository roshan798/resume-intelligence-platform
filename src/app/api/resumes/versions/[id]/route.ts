import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { UpdateDraftVersionService } from "@/modules/resumes/services/update-draft-version.service";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
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

    const body = await request.json();

    const params = await context.params;

    const service = new UpdateDraftVersionService();

    const result = await service.execute(
        {
            versionId: params.id,

            ...body,
        },
        session.user.id,
    );

    if (!result) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
}

export async function GET(
    request: NextRequest,
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

    const version = await prisma.resumeVersion.findFirst({
        where: {
            id: params.id,
            resume: {
                userId: session.user.id,
            },
        },

        include: {
            parent: true,
        },
    });

    if (!version) {
        return NextResponse.json(
            {
                message: "Version not found",
            },
            {
                status: 404,
            },
        );
    }

    return NextResponse.json(version);
}
