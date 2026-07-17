async function getDashboard() {
    // TODO get USRL from .env
    const response = await fetch("http://localhost:3000/api/dashboard", {
        cache: "no-store",
    });

    return response.json();
}

export default async function DashboardPage() {
    const stats = await getDashboard();

    return (
        <div className="space-y-6 p-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-4 gap-4">
                <Card
                    title="Resumes"
                    value={stats.totalResumes}
                />

                <Card
                    title="Applications"
                    value={stats.totalApplications}
                />

                <Card
                    title="JD Analyses"
                    value={stats.totalJDAnalyses}
                />

                <Card
                    title="Average Match"
                    value={`${stats.averageMatchScore}%`}
                />
            </div>
        </div>
    );
}

function Card({ title, value }: { title: string; value: string | number }) {
    return (
        <div className="rounded-lg border p-6">
            <p className="text-sm text-gray-500">{title}</p>

            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}
