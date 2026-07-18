import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsGrid } from "@/components/dashboard/stats-grid";

async function getDashboard() {
    // TODO get from .env
    const response = await fetch(
        "http://localhost:3000/api/dashboard",
        {
            cache: "no-store",
        },
    );

    return response.json();
}

export default async function DashboardPage() {
    const dashboard = await getDashboard();

    return (
        <main className="mx-auto flex max-w-7xl flex-col gap-8 p-8">
            <DashboardHeader />

            <StatsGrid
                stats={dashboard.stats}
            />
        </main>
    );
}