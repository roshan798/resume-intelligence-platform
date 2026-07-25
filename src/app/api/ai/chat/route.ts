import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import {
    AIChatAccessError,
    AIChatService,
} from "@/modules/ai/services/ai-chat.service";
import { sendChatMessageSchema } from "@/modules/ai/validations/ai-chat.schema";

const service = new AIChatService();

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        return NextResponse.json({ conversations: await service.list(session.user.id) });
    } catch (error) {
        return chatError(error);
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    const parsed = sendChatMessageSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { message: "Enter a message between 1 and 4,000 characters." },
            { status: 422 },
        );
    }

    try {
        const result = await service.send(session.user.id, parsed.data);
        return NextResponse.json(result, { status: parsed.data.conversationId ? 200 : 201 });
    } catch (error) {
        logger.error(
            { err: error, userId: session.user.id, conversationId: parsed.data.conversationId },
            "AI chat request failed",
        );
        return chatError(error);
    }
}

function chatError(error: unknown) {
    if (error instanceof AIChatAccessError) {
        const status = error.message === "Conversation not found." ? 404 : 403;
        return NextResponse.json({ message: error.message }, { status });
    }
    return NextResponse.json(
        { message: error instanceof Error ? error.message : "AI chat is unavailable." },
        { status: 503 },
    );
}
