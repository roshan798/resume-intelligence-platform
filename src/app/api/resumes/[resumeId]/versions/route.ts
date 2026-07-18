import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { GetResumeService } from "@/modules/resumes/services/get-resume.service";

export async function GET(
    request: Request,
    context: {
        params: Promise<{
            resumeId: string;
        }>;
    },
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await context.params;
    const service = new GetResumeService();
    const resume = await service.execute(session.user.id, resumeId);

    if (!resume) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(resume.versions);
}
