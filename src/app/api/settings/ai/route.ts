import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { AISettingsService } from "@/modules/ai/services/ai-settings.service";

const featureSetting = z.object({ provider: z.enum(["GEMINI", "GROQ"]), model: z.string().trim().min(1).max(120) });
const schema = z.object({
    preferredProvider: z.enum(["GEMINI", "GROQ"]),
    fallbackEnabled: z.boolean(),
    featureModels: z.record(z.string(), featureSetting),
    monthlyTokenLimit: z.number().int().min(1_000).max(100_000_000).nullable(),
    monthlyBudgetMicros: z.number().int().min(0).max(1_000_000_000).nullable(),
    perRequestMaxTokens: z.number().int().min(100).max(16_000),
});

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await new AISettingsService().get(session.user.id));
}

export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: "Invalid AI settings.", errors: parsed.error.flatten().fieldErrors }, { status: 422 });
    const updated = await new AISettingsService().update(session.user.id, parsed.data);
    return NextResponse.json(updated);
}
