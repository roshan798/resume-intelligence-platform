import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardHeader() {
    return (
        <div className="page-header">
            <div>
                <p className="page-eyebrow">Workspace overview</p>
                <h1 className="page-title">Your job search, at a glance</h1>
                <p className="page-description">Prioritize the next move, then improve the resume behind it.</p>
            </div>

            <div className="flex w-full gap-3 sm:w-auto"><Button className="flex-1 sm:flex-none" variant="outline" asChild><Link href="/resumes">Manage resumes</Link></Button><Button className="flex-1 sm:flex-none" asChild><Link href="/applications">Open pipeline</Link></Button></div>
        </div>
    );
}
