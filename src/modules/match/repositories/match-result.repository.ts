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

    async getByAnalysis(jdAnalysisId: string) {
        return prisma.matchResult.findMany({
            where: {
                jdAnalysisId,
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

    async getById(id: string) {
        return prisma.matchResult.findUnique({
            where: {
                id,
            },
        });
    }
}
