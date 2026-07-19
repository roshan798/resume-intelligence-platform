import { DashboardStatsDto } from "@/modules/dashboard/dto/dashboard.dto";
import { StatCard } from "./stat-card";

interface Props {
    stats: DashboardStatsDto;
}

export function StatsGrid({ stats }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Active applications"
                value={stats.activeApplications}
            />

            <StatCard
                title="Interviews"
                value={stats.interviews}
            />

            <StatCard
                title="Offers"
                value={stats.offers}
            />

            <StatCard
                title="Actions due this week"
                value={stats.upcomingActions}
            />
        </div>
    );
}
