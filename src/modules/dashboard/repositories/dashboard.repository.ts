import { ApplicationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma/prisma";

export class DashboardRepository {
    async getStats(userId: string) {
        const [resumes, applications, jdAnalyses, matchResults] =
            await Promise.all([
                prisma.resume.count({
                    where: {
                        userId,
                    },
                }),

                prisma.application.findMany({
                    where: {
                        userId,
                    },
                }),

                prisma.jDAnalysis.count({
                    where: {
                        userId,
                    },
                }),

                prisma.matchResult.findMany({
                    where: {
                        jdAnalysis: {
                            userId,
                        },
                    },
                    include: {
                        jdAnalysis: true,
                    },
                }),
            ]);

        const byStatus = {
            saved: applications.filter(
                (a) => a.status === ApplicationStatus.SAVED,
            ).length,

            applied: applications.filter(
                (a) => a.status === ApplicationStatus.APPLIED,
            ).length,

            oa: applications.filter((a) => a.status === ApplicationStatus.OA)
                .length,

            interview: applications.filter(
                (a) => a.status === ApplicationStatus.INTERVIEW,
            ).length,

            rejected: applications.filter(
                (a) => a.status === ApplicationStatus.REJECTED,
            ).length,

            offer: applications.filter(
                (a) => a.status === ApplicationStatus.OFFER,
            ).length,
        };

        const avgScore =
            matchResults.length === 0
                ? 0
                : matchResults.reduce(
                      (sum, item) => sum + Number(item.overallScore),
                      0,
                  ) / matchResults.length;

        const bestMatch =
            matchResults.length === 0
                ? null
                : matchResults.sort(
                      (a, b) => Number(b.overallScore) - Number(a.overallScore),
                  )[0];

        return {
            resumes,
            applications,
            jdAnalyses,
            byStatus,
            avgScore,
            bestMatch,
        };
    }
}
