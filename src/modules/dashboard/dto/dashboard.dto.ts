export interface DashboardStatsDto {
    totalResumes: number;
    totalApplications: number;
    averageAtsScore: number;
    aiSuggestionsGenerated: number;
    activeApplications: number;
    interviews: number;
    offers: number;
    upcomingActions: number;
}

export interface ActivityItemDto {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
}

export interface DashboardResponseDto {
    stats: DashboardStatsDto;

    recentResumes: {
        id: string;
        title: string;
        updatedAt: Date;
    }[];

    recentApplications: {
        id: string;
        company: string;
        roleTitle: string;
        status: string;
    }[];

    activities: ActivityItemDto[];
}
