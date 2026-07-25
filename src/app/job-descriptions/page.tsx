import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetJobDescriptionsService } from "@/modules/job-descriptions/services/get-job-descriptions.service";

export default async function JobDescriptionsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const jobDescriptions = await new GetJobDescriptionsService().execute(
        session.user.id,
    );

    return (
        <main className="app-page">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">Role intelligence</p>
                    <h1 className="page-title">Job descriptions</h1>
                    <p className="page-description">
                        Manage roles and preserve every analyzed text snapshot.
                    </p>
                </div>
                <Button asChild><Link href="/job-descriptions/new">Add job description</Link></Button>
            </div>

            {jobDescriptions.length === 0 ? (
                <div className="empty-state"><h2 className="text-lg font-semibold">No job descriptions yet</h2><p className="mt-2 text-sm text-muted-foreground">Add a role to extract keywords and compare it with your resumes.</p><Button className="mt-5" asChild><Link href="/job-descriptions/new">Add your first role</Link></Button></div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2">
                    {jobDescriptions.map((jobDescription) => {
                        const latest = jobDescription.snapshots[0];
                        return (
                            <Link key={jobDescription.id} href={`/job-descriptions/${jobDescription.id}`}>
                                <Card className="h-full transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                                    <CardHeader className="flex-row items-start justify-between gap-3">
                                        <div>
                                            <CardTitle>{jobDescription.roleTitle}</CardTitle>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {jobDescription.company || "Company not specified"}
                                            </p>
                                        </div>
                                        <Badge variant={jobDescription.status === "ACTIVE" ? "default" : "secondary"}>
                                            {jobDescription.status}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                                        <p>{jobDescription.location || "Location not specified"}</p>
                                        <p>{jobDescription._count.snapshots} snapshot(s)</p>
                                        {latest && <p>Latest snapshot: {latest.createdAt.toLocaleDateString()}</p>}
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
