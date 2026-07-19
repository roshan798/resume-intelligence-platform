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
        <main className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Job Descriptions</h1>
                    <p className="mt-2 text-muted-foreground">
                        Manage roles and preserve every analyzed text snapshot.
                    </p>
                </div>
                <Button asChild><Link href="/job-descriptions/new">Add job description</Link></Button>
            </div>

            {jobDescriptions.length === 0 ? (
                <Card><CardContent className="p-10 text-center text-muted-foreground">No saved job descriptions yet.</CardContent></Card>
            ) : (
                <div className="grid gap-5 md:grid-cols-2">
                    {jobDescriptions.map((jobDescription) => {
                        const latest = jobDescription.snapshots[0];
                        return (
                            <Link key={jobDescription.id} href={`/job-descriptions/${jobDescription.id}`}>
                                <Card className="h-full transition hover:border-primary">
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
