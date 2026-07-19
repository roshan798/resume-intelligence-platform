import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { CreateJobDescriptionService } from "@/modules/job-descriptions/services/create-job-description.service";
import { GetJobDescriptionsService } from "@/modules/job-descriptions/services/get-job-descriptions.service";
import { createJobDescriptionSchema } from "@/modules/job-descriptions/validations/job-description.schema";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const service = new GetJobDescriptionsService();
    return NextResponse.json(await service.execute(session.user.id));
}

export async function POST(request: Request) {
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

    const parsed = createJobDescriptionSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            {
                message: "Invalid job description.",
                errors: parsed.error.flatten().fieldErrors,
            },
            { status: 400 },
        );
    }

    const service = new CreateJobDescriptionService();
    const result = await service.execute(session.user.id, parsed.data);
    return NextResponse.json(result, { status: 201 });
}
