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

export interface RecentApplicationDto {
    id: string;
    company: string;
    roleTitle: string;
    status: string;
    updatedAt: Date;
}

export interface ActivityDto {
    id: string;
    type: string;
    title: string;
    createdAt: Date;
}

export interface DashboardDto {
    stats: DashboardStatsDto;

    recentResumes: RecentResumeDto[];

    recentApplications: RecentApplicationDto[];

    activity: ActivityDto[];
}