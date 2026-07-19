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

    findForDraft(
        parentVersionId: string,
        jdSnapshotId: string,
        userId: string,
    ) {
        return prisma.aISuggestion.findMany({
            where: {
                resumeVersionId: parentVersionId,
                jdAnalysisId: jdSnapshotId,
                status: { in: ["ACCEPTED", "APPLIED", "MANUALLY_APPLIED"] },
                resumeVersion: { resume: { userId } },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    findApplicable(id: string, draftVersionId: string, userId: string) {
        return prisma.aISuggestion.findFirst({
            where: {
                id,
                status: "ACCEPTED",
                resumeVersion: {
                    resume: {
                        userId,
                        versions: {
                            some: {
                                id: draftVersionId,
                                parentVersionId: { not: null },
                                status: "TAILORED_DRAFT",
                            },
                        },
                    },
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

    applyToLatexDraft(data: {
        suggestionId: string;
        draftVersionId: string;
        latexSource: string;
        rawText: string;
        parsedSections: Prisma.InputJsonValue;
        canonicalKeywords: Prisma.InputJsonValue;
        fingerprintHash: string;
    }) {
        return prisma.$transaction(async (transaction) => {
            const version = await transaction.resumeVersion.update({
                where: { id: data.draftVersionId },
                data: {
                    latexSource: data.latexSource,
                    rawText: data.rawText,
                    parsedSections: data.parsedSections,
                    canonicalKeywords: data.canonicalKeywords,
                    fingerprintHash: data.fingerprintHash,
                },
            });
            await transaction.aISuggestion.update({
                where: { id: data.suggestionId },
                data: { status: "APPLIED" },
            });
            return version;
        });
    }
}
