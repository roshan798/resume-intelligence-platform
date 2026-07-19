import { prisma } from "@/lib/prisma";

export class DashboardRepository {
    async getStats(userId: string) {
        const [resumes, applications, activeApplications, interviews, offers, upcomingActions, suggestions, aiUsage, matches] = await Promise.all(
            [
                prisma.resume.count({
                    where: { userId },
                }),

                prisma.application.count({
                    where: { userId },
                }),

                prisma.application.count({
                    where: { userId, status: { notIn: ["REJECTED", "CLOSED"] } },
                }),

                prisma.application.count({ where: { userId, status: "INTERVIEW" } }),

                prisma.application.count({ where: { userId, status: "OFFER" } }),

                prisma.application.count({
                    where: {
                        userId,
                        nextActionDate: { gte: new Date(), lte: new Date(Date.now() + 7 * 86_400_000) },
                    },
                }),

                prisma.aISuggestion.aggregate({
                    where: {
                        resumeVersion: {
                            resume: {
                                userId,
                            },
                        },
                    },
                    _count: { id: true },
                    _sum: {
                        totalTokens: true,
                        estimatedCostMicros: true,
                    },
                }),

                prisma.aIUsage.aggregate({
                    where: { userId },
                    _sum: { totalTokens: true, estimatedCostMicros: true },
                }),

                prisma.matchResult.findMany({
                    where: {
                        resumeVersion: {
                            resume: {
                                userId,
                            },
                        },
                    },
                    select: {
                        overallScore: true,
                    },
                }),
            ],
        );

        const average =
            matches.length === 0
                ? 0
                : matches.reduce(
                      (sum, item) => sum + Number(item.overallScore),
                      0,
                  ) / matches.length;

        return {
            totalResumes: resumes,
            totalApplications: applications,
            aiSuggestionsGenerated: suggestions._count.id,
            aiTokensUsed: aiUsage._sum.totalTokens ?? 0,
            aiEstimatedCostMicros: aiUsage._sum.estimatedCostMicros ?? 0,
            averageAtsScore: Number(average.toFixed(2)),
            activeApplications,
            interviews,
            offers,
            upcomingActions,
        };
    }

    async getRecentResumes(userId: string) {
        return prisma.resumeVersion.findMany({
            where: {
                resume: {
                    userId,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },

            include: {
                resume: {
                    select: {
                        title: true,
                    },
                },
            },
            take: 5,
        });
    }

    async getRecentApplications(userId: string) {
        return prisma.application.findMany({
            where: { userId },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
            include: {
                resumeVersion: { select: { resume: { select: { title: true } }, versionNumber: true } },
            },
        });
    }

    async getRecentActivity(userId: string) {
        return prisma.applicationStatusHistory.findMany({
            where: { application: { userId } },
            orderBy: { changedAt: "desc" },
            take: 6,
            include: { application: { select: { company: true, roleTitle: true } } },
        });
    }
}
