export interface DashboardStatsDto {
    totalResumes: number;
    totalApplications: number;
    totalInterviews: number;
    averageMatchScore: number;
}

export interface RecentResumeDto {
    id: string;
    title: string;
    versionNumber: number;
    status: string;
    updatedAt: Date;
}

export interface DashboardDto {
    stats: DashboardStatsDto;
    recentResumes: RecentResumeDto[];
}
