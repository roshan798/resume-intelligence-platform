import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import { UpdateDraftVersionService } from "@/modules/resumes/services/update-draft-version.service";
import { GetVersionService } from "@/modules/resumes/services/get-version.service";

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
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            {
                status: 401,
            },
        );
    }

    const params = await context.params;

    const service = new GetVersionService();

    const version = await service.execute(params.id, session.user.id);

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
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            {
                status: 401,
            },
        );
    }

    const params = await context.params;

    const body = await request.json();

    const service = new UpdateDraftVersionService();

    const updated = await service.execute(
        {
            versionId: params.id,
            ...body,
        },
        session.user.id,
    );

    if (!updated) {
        return NextResponse.json(
            {
                message: "Version not found",
            },
            {
                status: 404,
            },
        );
    }

    return NextResponse.json(updated);
}
