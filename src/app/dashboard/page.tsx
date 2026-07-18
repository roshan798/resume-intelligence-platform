import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentApplications } from "@/components/dashboard/recent-applications";
import { RecentResumes } from "@/components/dashboard/recent-resumes";

async function getDashboard() {
    // TODO get from .env
    const response = await fetch("http://localhost:3000/api/dashboard", {
        cache: "no-store",
    });

    return response.json();
}

export default async function DashboardPage() {
    const dashboard = await getDashboard();

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
                    <ActivityFeed activity={dashboard.activity} />
                </div>

                <QuickActions />
            </div>
        </main>
    );
}
