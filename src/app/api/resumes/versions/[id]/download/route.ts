import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import {
    DownloadVersionService,
    type ResumeDownloadFormat,
} from "@/modules/resumes/services/download-version.service";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

function isDownloadFormat(value: string | null): value is ResumeDownloadFormat {
    return value === "txt" || value === "tex";
}

export async function GET(request: NextRequest, context: RouteContext) {
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

    const format = request.nextUrl.searchParams.get("format");

    if (!isDownloadFormat(format)) {
        return NextResponse.json(
            {
                message: 'Invalid download format. Use "txt" or "tex".',
            },
            {
                status: 400,
            },
        );
    }

    const { id } = await context.params;

    const service = new DownloadVersionService();

    try {
        const download = await service.execute({
            versionId: id,
            userId: session.user.id,
            format,
        });

        if (!download) {
            return NextResponse.json(
                {
                    message: "Resume version not found.",
                },
                {
                    status: 404,
                },
            );
        }

        return new NextResponse(download.content, {
            status: 200,
            headers: {
                "Content-Type": download.contentType,
                "Content-Disposition": `attachment; filename="${download.fileName}"`,
                "Cache-Control": "private, no-store",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unable to download resume version.";

        return NextResponse.json(
            {
                message,
            },
            {
                status: 400,
            },
        );
    }
}
