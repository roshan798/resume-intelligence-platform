import type { AISuggestionStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export class AISuggestionRepository {
    findMatchContext(matchResultId: string, userId: string) {
        return prisma.matchResult.findFirst({
            where: { id: matchResultId, jdAnalysis: { userId } },
            select: {
                id: true,
                matchedKeywords: true,
                missingKeywords: true,
                weakKeywords: true,
                resumeVersion: {
                    select: { id: true, rawText: true },
                },
                jdAnalysis: {
                    select: { id: true, rawText: true, parsedKeywords: true },
                },
            },
        });
    }

    create(data: Prisma.AISuggestionUncheckedCreateInput) {
        return prisma.aISuggestion.create({ data });
    }

    findAllByUser(userId: string) {
        return prisma.aISuggestion.findMany({
            where: { resumeVersion: { resume: { userId } } },
            orderBy: { createdAt: "desc" },
            include: {
                resumeVersion: {
                    select: {
                        versionNumber: true,
                        resume: { select: { title: true } },
                    },
                },
                jdAnalysis: {
                    select: { company: true, roleTitle: true },
                },
            },
        });
    }

    async updateStatus(id: string, userId: string, status: AISuggestionStatus) {
        const result = await prisma.aISuggestion.updateMany({
            where: { id, resumeVersion: { resume: { userId } } },
            data: { status },
        });
        return result.count > 0;
    }
}
