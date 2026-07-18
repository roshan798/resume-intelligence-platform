import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import { DeleteVersionService } from "@/modules/resumes/services/delete-version.service";
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

interface DeleteRouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function DELETE(_request: Request, context: DeleteRouteContext) {
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

    const { id } = await context.params;

    const service = new DeleteVersionService();

    try {
        const result = await service.execute({
            versionId: id,
            userId: session.user.id,
        });

        if (!result) {
            return NextResponse.json(
                {
                    message: "Resume version not found.",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            message: "Resume version deleted successfully.",
            resumeId: result.resumeId,
            deletedVersionId: result.deletedVersionId,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unable to delete resume version.";

        return NextResponse.json(
            {
                message,
            },
            {
                status: 409,
            },
        );
    }
}
