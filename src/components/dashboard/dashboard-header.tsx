import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardHeader() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Workspace overview</p>
                <h1 className="mt-2 text-4xl font-bold">Your job search, at a glance</h1>
                <p className="mt-2 text-muted-foreground">Prioritize the next move, then improve the resume behind it.</p>
            </div>

            <div className="flex gap-3"><Button variant="outline" asChild><Link href="/resumes">Manage resumes</Link></Button><Button asChild><Link href="/applications">Open pipeline</Link></Button></div>
        </div>
    );
}
