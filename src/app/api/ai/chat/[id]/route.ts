import { NextResponse } from "next/server";
import { AIChatResponseStyle } from "@prisma/client";

import { auth } from "@/auth";
import {
    AIChatAccessError,
    AIChatService,
} from "@/modules/ai/services/ai-chat.service";
import {
    renameChatConversationSchema,
    updateChatContextSchema,
    updateChatResponseStyleSchema,
} from "@/modules/ai/validations/ai-chat.schema";

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

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    const style = updateChatResponseStyleSchema.safeParse(body);
    if (style.success) {
        try {
            const updated = await service.setResponseStyle(
                session.user.id,
                (await params).id,
                AIChatResponseStyle[style.data.responseStyle],
            );
            if (!updated) {
                return NextResponse.json({ message: "Conversation not found." }, { status: 404 });
            }
            return NextResponse.json({ responseStyle: style.data.responseStyle });
        } catch (error) {
            return accessError(error);
        }
    }

    const context = updateChatContextSchema.safeParse(body);
    if (context.success) {
        try {
            const updated = await service.setContext(
                session.user.id,
                (await params).id,
                context.data,
            );
            if (!updated) {
                return NextResponse.json({ message: "Conversation not found." }, { status: 404 });
            }
            return NextResponse.json({ context: context.data });
        } catch (error) {
            return accessError(error);
        }
    }

    const parsed = renameChatConversationSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { message: parsed.error.issues[0]?.message ?? "Invalid title." },
            { status: 422 },
        );
    }
    try {
        const renamed = await service.rename(
            session.user.id,
            (await params).id,
            parsed.data.title,
        );
        if (!renamed) {
            return NextResponse.json({ message: "Conversation not found." }, { status: 404 });
        }
        return NextResponse.json({ title: parsed.data.title });
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
