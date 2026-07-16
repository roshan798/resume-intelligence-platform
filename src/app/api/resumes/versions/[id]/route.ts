import { NextRequest, NextResponse } from "next/server";

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
    const body = await request.json();

    const params = await context.params;

    const service = new UpdateDraftVersionService();

    const result = await service.execute({
        versionId: params.id,

        ...body,
    });

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
    const params = await context.params;

    const version = await prisma.resumeVersion.findUnique({
        where: {
            id: params.id,
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
