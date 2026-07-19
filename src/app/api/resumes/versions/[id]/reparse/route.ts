import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ReparseVersionService } from "@/modules/resumes/services/reparse-version.service";

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> },
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const version = await new ReparseVersionService().execute(
            id,
            session.user.id,
        );

        if (!version) {
            return NextResponse.json(
                { message: "Resume version not found." },
                { status: 404 },
            );
        }

        return NextResponse.json(version);
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to reparse this resume version.",
            },
            { status: 422 },
        );
    }
}
