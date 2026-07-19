import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GetResumeService } from "@/modules/resumes/services/get-resume.service";
import { UpdateResumeService } from "@/modules/resumes/services/update-resume.service";
import { updateResumeSchema } from "@/modules/resumes/validations/update-resume.schema";
interface RouteContext {
    params: Promise<{ resumeId: string }>;
}
export async function GET(request: Request, context: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { resumeId } = await context.params;
    const service = new GetResumeService();
    const resume = await service.execute(session.user.id, resumeId);
    if (!resume) {
        return NextResponse.json(
            { message: "Resume not found" },
            { status: 404 },
        );
    }
    return NextResponse.json(resume);
}

export async function PATCH(request: Request, context: RouteContext) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { message: "Request body must be valid JSON." },
            { status: 400 },
        );
    }

    const parsed = updateResumeSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {
                message: "Invalid resume metadata.",
                errors: parsed.error.flatten().fieldErrors,
            },
            { status: 400 },
        );
    }

    const { resumeId } = await context.params;
    const service = new UpdateResumeService();
    const updated = await service.execute({
        resumeId,
        userId: session.user.id,
        ...parsed.data,
    });

    if (!updated) {
        return NextResponse.json(
            { message: "Resume not found" },
            { status: 404 },
        );
    }

    return NextResponse.json({
        id: updated.id,
        title: updated.title,
        primaryStack: updated.primaryStack,
        tags: updated.tags.map((tag) => tag.tag),
        updatedAt: updated.updatedAt,
    });
}
