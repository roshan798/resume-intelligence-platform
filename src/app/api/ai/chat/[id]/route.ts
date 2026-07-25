import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
    AIChatAccessError,
    AIChatService,
} from "@/modules/ai/services/ai-chat.service";

const service = new AIChatService();

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const conversation = await service.messages(session.user.id, (await params).id);
        if (!conversation) {
            return NextResponse.json({ message: "Conversation not found." }, { status: 404 });
        }
        return NextResponse.json({ conversation });
    } catch (error) {
        return accessError(error);
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const deleted = await service.delete(session.user.id, (await params).id);
        if (!deleted) {
            return NextResponse.json({ message: "Conversation not found." }, { status: 404 });
        }
        return new Response(null, { status: 204 });
    } catch (error) {
        return accessError(error);
    }
}

function accessError(error: unknown) {
    if (error instanceof AIChatAccessError) {
        return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json({ message: "AI chat is unavailable." }, { status: 503 });
}
