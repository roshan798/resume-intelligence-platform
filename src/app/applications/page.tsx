import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { KanbanBoard } from "@/components/applications/kanban-board";
import { Button } from "@/components/ui/button";
import { ApplicationRepository } from "@/modules/applications/repositories/application.repository";

export default async function ApplicationsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");
    const applications = await new ApplicationRepository().findByUserId(session.user.id);
    const active = applications.filter((item) => !["REJECTED", "CLOSED"].includes(item.status)).length;
    const interviews = applications.filter((item) => item.status === "INTERVIEW").length;
    const offers = applications.filter((item) => item.status === "OFFER").length;

    return (
        <main className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Job search pipeline</p><h1 className="mt-2 text-4xl font-bold">Applications</h1><p className="mt-2 max-w-2xl text-muted-foreground">Track every opportunity, the resume you sent, and the next action that moves it forward.</p></div>
                <Button asChild><Link href="/job-descriptions">Find a matched role</Link></Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Active pipeline" value={active} />
                <Metric label="Interviews" value={interviews} />
                <Metric label="Offers" value={offers} />
            </div>
            {applications.length ? <KanbanBoard applications={applications} /> : <div className="border border-dashed p-12 text-center"><h2 className="text-xl font-semibold">No applications yet</h2><p className="mt-2 text-sm text-muted-foreground">Run a resume match and save the opportunity to start your pipeline.</p><Button className="mt-5" asChild><Link href="/job-descriptions">Open job descriptions</Link></Button></div>}
        </main>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return <div className="border bg-card p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>;
}
