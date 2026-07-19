import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { BackgroundJobRepository } from "@/modules/background-jobs/repositories/background-job.repository";
import { AISuggestionRepository } from "@/modules/ai/repositories/ai-suggestion.repository";
import { AISuggestionService } from "@/modules/ai/services/ai-suggestion.service";

const schema = z.object({ matchResultId: z.uuid() });

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: "A valid match result is required." }, { status: 422 });
    const context = await new AISuggestionRepository().findMatchContext(parsed.data.matchResultId, session.user.id);
    if (!context) return NextResponse.json({ message: "Match result not found." }, { status: 404 });
    const repository = new BackgroundJobRepository();
    const background = await repository.create({
        userId: session.user.id,
        type: "GENERATE_AI",
        payload: { matchResultId: parsed.data.matchResultId },
    });
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
        try {
            const suggestion = await new AISuggestionService().generateFromMatch(
                parsed.data.matchResultId,
                session.user.id,
            );
            if (!suggestion) throw new Error("Match result not found.");
            await repository.complete(background.id, { suggestionId: suggestion.id, execution: "inline-fallback" });
            logger.warn({ backgroundJobId: background.id }, "Redis is not configured; AI job completed inline");
            return NextResponse.json({ jobId: background.id }, { status: 202 });
        } catch (error) {
            await repository.fail(background.id, error instanceof Error ? error.message : "AI generation failed");
            return NextResponse.json({ message: error instanceof Error ? error.message : "Suggestion generation failed." }, { status: 422 });
        }
    }
    try {
        const { aiQueue } = await import("@/workers/queues/ai.queue");
        const queued = await Promise.race([
            aiQueue.add("generate-match-suggestions", {
                backgroundJobId: background.id,
                matchResultId: parsed.data.matchResultId,
                userId: session.user.id,
            }),
            new Promise<never>((_, reject) =>
                setTimeout(
                    () => reject(new Error("Queue connection timed out.")),
                    5_000,
                ),
            ),
        ]);
        await repository.update(background.id, { queueJobId: String(queued.id) });
        return NextResponse.json({ jobId: background.id }, { status: 202 });
    } catch (error) {
        await repository.fail(background.id, error instanceof Error ? error.message : "Queue unavailable");
        logger.error({ err: error, backgroundJobId: background.id }, "Failed to enqueue AI suggestion job");
        return NextResponse.json({ message: "The AI queue is unavailable. Start Redis and the worker process, then retry." }, { status: 503 });
    }
}
