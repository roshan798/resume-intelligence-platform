import { prisma } from "@/lib/prisma";

export class DashboardRepository {
    async getStats(userId: string) {
        const [totalResumes, totalApplications, interviews, matches] =
            await Promise.all([
                prisma.resume.count({
                    where: {
                        userId,
                    },
                }),

                prisma.application.count({
                    where: {
                        userId,
                    },
                }),

                prisma.application.count({
                    where: {
                        userId,
                        status: "INTERVIEW",
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
            ]);

        const averageMatchScore =
            matches.length === 0
                ? 0
                : Number(
                      (
                          matches.reduce(
                              (sum, item) => sum + Number(item.overallScore),
                              0,
                          ) / matches.length
                      ).toFixed(2),
                  );

        return {
            totalResumes,
            totalApplications,
            totalInterviews: interviews,
            averageMatchScore,
        };
    }

    async getRecentResumes(userId: string) {
        return prisma.resumeVersion.findMany({
            where: {
                resume: {
                    userId,
                },
            },
            include: {
                resume: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
            take: 5,
        });
    }
}
