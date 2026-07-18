import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ArchiveVersionService } from "@/modules/resumes/services/archive-version.service";

export async function POST(
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

    const { id } = await context.params;

    const service = new ArchiveVersionService();

    const version = await service.execute(id, session.user.id);

    return NextResponse.json(version);
}
