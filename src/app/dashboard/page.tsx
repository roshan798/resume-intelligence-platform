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
        <main className="app-page">
            <DashboardHeader />

            <StatsGrid stats={dashboard.stats} />
            <section className="grid gap-4 rounded-xl bg-foreground p-6 text-background shadow-sm md:grid-cols-[1fr_auto] md:items-center sm:p-8">
                <div><p className="text-xs uppercase tracking-[0.2em] opacity-70">Pipeline snapshot</p><h2 className="mt-2 text-2xl font-semibold">{dashboard.stats.totalApplications} tracked roles · {dashboard.stats.averageAtsScore}% average match</h2><p className="mt-2 text-sm opacity-70">You have {dashboard.stats.totalResumes} resumes and {dashboard.stats.aiSuggestionsGenerated} AI suggestions in your workspace.</p></div>
            </section>
            <section className="grid overflow-hidden rounded-xl border bg-card md:grid-cols-3 md:divide-x">
                <div className="p-6"><p className="text-xs uppercase tracking-widest text-muted-foreground">AI usage</p><p className="mt-2 text-2xl font-bold">{dashboard.stats.aiTokensUsed.toLocaleString()}</p><p className="text-sm text-muted-foreground">recorded tokens</p></div>
                <div className="border-t p-6 md:border-t-0"><p className="text-xs uppercase tracking-widest text-muted-foreground">Estimated cost</p><p className="mt-2 text-2xl font-bold">${(dashboard.stats.aiEstimatedCostMicros / 1_000_000).toFixed(4)}</p><p className="text-sm text-muted-foreground">Free-tier calls remain $0</p></div>
                <div className="border-t p-6 md:border-t-0"><p className="text-xs uppercase tracking-widest text-muted-foreground">Efficiency</p><p className="mt-2 text-lg font-semibold">Cached suggestions are reused</p><p className="text-sm text-muted-foreground">Same match + prompt version avoids another provider call.</p></div>
            </section>
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
