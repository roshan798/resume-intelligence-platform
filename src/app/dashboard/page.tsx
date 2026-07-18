import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentApplications } from "@/components/dashboard/recent-applications";
import { RecentResumes } from "@/components/dashboard/recent-resumes";
import { auth } from "@/auth";
import { DashboardService } from "@/modules/dashboard/services/dashboard.service";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) {
        // This should be handled by middleware, but as a fallback
        return null;
    }

    const dashboardService = new DashboardService();
    const dashboard = await dashboardService.execute(session.user.id);

    return (
        <main className="mx-auto flex max-w-7xl flex-col gap-8 p-8">
            <DashboardHeader />

            <StatsGrid stats={dashboard.stats} />
            <div className="grid gap-6 lg:grid-cols-2">
                <RecentResumes resumes={dashboard.recentResumes} />

                <RecentApplications
                    applications={dashboard.recentApplications}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ActivityFeed activity={dashboard.activities} />
                </div>

                <QuickActions />
            </div>
        </main>
    );
}
