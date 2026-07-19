import { ApplicationStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ApplicationService } from "@/modules/applications/services/application.service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const status = typeof body.status === "string" && Object.values(ApplicationStatus).includes(body.status as ApplicationStatus) ? body.status as ApplicationStatus : undefined;
    const parseDate = (value: unknown) => {
        if (typeof value !== "string" || !value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    };
    const result = await new ApplicationService().update(id, session.user.id, {
        ...(status ? { status } : {}),
        ...(status === ApplicationStatus.APPLIED && body.appliedDate === undefined ? { appliedDate: new Date() } : {}),
        ...(body.appliedDate !== undefined ? { appliedDate: parseDate(body.appliedDate) } : {}),
        ...(typeof body.notes === "string" ? { notes: body.notes.trim() || null } : {}),
        ...(typeof body.applicationUrl === "string" ? { applicationUrl: body.applicationUrl.trim() || null } : {}),
        ...(typeof body.location === "string" ? { location: body.location.trim() || null } : {}),
        ...(typeof body.nextAction === "string" ? { nextAction: body.nextAction.trim() || null } : {}),
        ...(body.nextActionDate !== undefined ? { nextActionDate: parseDate(body.nextActionDate) } : {}),
    });
    if (!result) return NextResponse.json({ message: "Application not found." }, { status: 404 });
    return NextResponse.json(result);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    const deleted = await new ApplicationService().delete(id, session.user.id);
    if (!deleted) return NextResponse.json({ message: "Application not found." }, { status: 404 });
    return NextResponse.json({ id });
}
