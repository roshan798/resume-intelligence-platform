import { DashboardStatsDto } from "@/modules/dashboard/dto/dashboard.dto";
import { StatCard } from "./stat-card";

interface Props {
    stats: DashboardStatsDto;
}

export function StatsGrid({ stats }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Resumes"
                value={stats.totalResumes}
            />

            <StatCard
                title="Applications"
                value={stats.totalApplications}
            />

            <StatCard
                title="Interviews"
                value={stats.totalInterviews}
            />

            <StatCard
                title="Average ATS"
                value={`${stats.averageMatchScore}%`}
            />
        </div>
    );
}
