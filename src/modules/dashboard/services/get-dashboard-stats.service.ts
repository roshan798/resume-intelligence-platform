import { DashboardRepository } from "../repositories/dashboard.repository";

export class GetDashboardStatsService {
    private readonly repository = new DashboardRepository();

    async execute(userId: string) {
        const result = await this.repository.getStats(userId);

        return {
            totalResumes: result.resumes,
            totalApplications: result.applications.length,
            totalJDAnalyses: result.jdAnalyses,

            applicationsByStatus: result.byStatus,

            averageMatchScore: Number(result.avgScore.toFixed(2)),

            bestMatch:
                result.bestMatch == null
                    ? null
                    : {
                          matchId: result.bestMatch.id,
                          company: result.bestMatch.jdAnalysis.company,
                          roleTitle: result.bestMatch.jdAnalysis.roleTitle,
                          score: Number(result.bestMatch.overallScore),
                      },
        };
    }
}
