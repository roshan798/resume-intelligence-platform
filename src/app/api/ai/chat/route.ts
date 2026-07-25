import { NextRequest, NextResponse } from "next/server";
import { AIChatResponseStyle } from "@prisma/client";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import {
    AIChatAccessError,
    AIChatService,
} from "@/modules/ai/services/ai-chat.service";
import { sendChatMessageSchema } from "@/modules/ai/validations/ai-chat.schema";

const service = new AIChatService();

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const query = request.nextUrl.searchParams.get("q") ?? undefined;
        return NextResponse.json({ conversations: await service.list(session.user.id, query) });
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

    const encoder = new TextEncoder();
    const userId = session.user.id;
    const chatInput = {
        ...parsed.data,
        responseStyle: parsed.data.responseStyle
            ? AIChatResponseStyle[parsed.data.responseStyle]
            : undefined,
    };
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const event of service.sendStream(userId, chatInput)) {
                    controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
                }
            } catch (error) {
                logger.error(
                    { err: error, userId, conversationId: parsed.data.conversationId },
                    "AI chat streaming request failed",
                );
                controller.enqueue(
                    encoder.encode(`${JSON.stringify({
                        type: "error",
                        message: error instanceof Error ? error.message : "AI chat is unavailable.",
                    })}\n`),
                );
            } finally {
                controller.close();
            }
        },
    });
    return new Response(stream, {
        headers: {
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Content-Type-Options": "nosniff",
        },
    });
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
