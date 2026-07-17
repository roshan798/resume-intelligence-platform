export interface DashboardStatsDto {
    totalResumes: number;
    totalApplications: number;
    totalJDAnalyses: number;

    applicationsByStatus: {
        saved: number;
        applied: number;
        oa: number;
        interview: number;
        rejected: number;
        offer: number;
    };

    averageMatchScore: number;

    bestMatch: {
        matchId: string;
        company: string | null;
        roleTitle: string | null;
        score: number;
    } | null;
}
