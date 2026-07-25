import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { CreateJobDescriptionService } from "@/modules/job-descriptions/services/create-job-description.service";
import { GetJobDescriptionsService } from "@/modules/job-descriptions/services/get-job-descriptions.service";
import { createJobDescriptionSchema } from "@/modules/job-descriptions/validations/job-description.schema";
import { RunMatchAnalysisService } from "@/modules/match/services/run-match-analysis.service";
import { MatchResultRepository } from "@/modules/match/repositories/match-result.repository";
import { logger } from "@/lib/logger";

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
    try {
        const matchSummary = await new RunMatchAnalysisService().execute(
            result.snapshot.id,
            session.user.id,
        );
        const rankedMatches = await new MatchResultRepository().getByAnalysisAndUser(
            result.snapshot.id,
            session.user.id,
        );
        return NextResponse.json(
            {
                ...result,
                matching: {
                    count: matchSummary?.count ?? 0,
                    bestMatchId: rankedMatches[0]?.id ?? null,
                    bestScore: rankedMatches[0]
                        ? Number(rankedMatches[0].overallScore)
                        : null,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        logger.error(
            {
                err: error,
                userId: session.user.id,
                snapshotId: result.snapshot.id,
            },
            "Job description saved but automatic matching failed",
        );
        return NextResponse.json(
            {
                ...result,
                matching: { count: 0, bestMatchId: null, bestScore: null },
                warning:
                    "The job description was saved, but automatic matching could not finish. You can retry from its details page.",
            },
            { status: 201 },
        );
    }
}
