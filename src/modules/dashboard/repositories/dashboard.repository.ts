import { prisma } from "@/lib/prisma";

export class DashboardRepository {
    async getStats(userId: string) {
        const [resumes, applications, suggestions, matches] = await Promise.all(
            [
                prisma.resume.count({
                    where: { userId },
                }),

                prisma.application.count({
                    where: { userId },
                }),

                prisma.aISuggestion.count({
                    where: {
                        resumeVersion: {
                            resume: {
                                userId,
                            },
                        },
                    },
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
            aiSuggestionsGenerated: suggestions,
            averageAtsScore: Number(average.toFixed(2)),
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
        });
    }
}
