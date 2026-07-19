import { prisma } from "@/lib/prisma";
// Import the Prisma namespace directly from the core client location
import { Prisma } from "@prisma/client";

export class MatchResultRepository {
    // Fix: Explicitly type 'data' as an array of MatchResult bulk creation items
    async createMany(data: Prisma.MatchResultCreateManyInput[]) {
        return prisma.matchResult.createMany({
            data,
        });
    }

    async replaceForAnalysis(
        jdAnalysisId: string,
        data: Prisma.MatchResultCreateManyInput[],
    ) {
        return prisma.$transaction(async (transaction) => {
            await transaction.matchResult.deleteMany({ where: { jdAnalysisId } });
            if (data.length === 0) return { count: 0 };
            return transaction.matchResult.createMany({ data });
        });
    }

    async getByAnalysisAndUser(jdAnalysisId: string, userId: string) {
        return prisma.matchResult.findMany({
            where: {
                jdAnalysisId,
                jdAnalysis: {
                    userId,
                },
            },

            orderBy: {
                overallScore: "desc",
            },

            include: {
                resumeVersion: {
                    include: {
                        resume: true,
                    },
                },
            },
        });
    }

    async getByIdAndUser(id: string, userId: string) {
        return prisma.matchResult.findFirst({
            where: {
                id,
                jdAnalysis: {
                    userId,
                },
            },
            include: {
                resumeVersion: {
                    include: {
                        resume: true,
                    },
                },
                jdAnalysis: true,
            },
        });
    }
}
