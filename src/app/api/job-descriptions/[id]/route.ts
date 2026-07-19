import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { DeleteJobDescriptionService } from "@/modules/job-descriptions/services/delete-job-description.service";
import { GetJobDescriptionService } from "@/modules/job-descriptions/services/get-job-description.service";
import { UpdateJobDescriptionService } from "@/modules/job-descriptions/services/update-job-description.service";
import { updateJobDescriptionSchema } from "@/modules/job-descriptions/validations/job-description.schema";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const service = new GetJobDescriptionService();
    const result = await service.execute(id, session.user.id);
    if (!result) {
        return NextResponse.json(
            { message: "Job description not found." },
            { status: 404 },
        );
    }

    return NextResponse.json(result);
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

    const parsed = updateJobDescriptionSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            {
                message: "Invalid job description metadata.",
                errors: parsed.error.flatten().fieldErrors,
            },
            { status: 400 },
        );
    }

    const { id } = await context.params;
    const service = new UpdateJobDescriptionService();
    const result = await service.execute(id, session.user.id, parsed.data);
    if (!result) {
        return NextResponse.json(
            { message: "Job description not found." },
            { status: 404 },
        );
    }

    return NextResponse.json(result);
}

export async function DELETE(_request: Request, context: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const service = new DeleteJobDescriptionService();
    try {
        const result = await service.execute(id, session.user.id);
        if (!result) {
            return NextResponse.json(
                { message: "Job description not found." },
                { status: 404 },
            );
        }
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to delete job description.",
            },
            { status: 409 },
        );
    }
}
