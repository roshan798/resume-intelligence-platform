import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { JobDescriptionActions } from "@/components/job-descriptions/job-description-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetJobDescriptionService } from "@/modules/job-descriptions/services/get-job-description.service";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function JobDescriptionPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user?.id) notFound();
    const { id } = await params;
    const jobDescription = await new GetJobDescriptionService().execute(
        id,
        session.user.id,
    );
    if (!jobDescription) notFound();

    return (
        <main className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold">{jobDescription.roleTitle}</h1>
                        <Badge variant={jobDescription.status === "ACTIVE" ? "default" : "secondary"}>
                            {jobDescription.status}
                        </Badge>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                        {jobDescription.company || "Company not specified"}
                        {jobDescription.location ? ` · ${jobDescription.location}` : ""}
                    </p>
                </div>
                <Button asChild variant="outline"><Link href="/job-descriptions">Back</Link></Button>
            </div>

            <JobDescriptionActions
                id={jobDescription.id}
                status={jobDescription.status}
                metadata={{
                    company: jobDescription.company,
                    roleTitle: jobDescription.roleTitle,
                    location: jobDescription.location,
                    sourceUrl: jobDescription.sourceUrl,
                    experienceRequirements: jobDescription.experienceRequirements,
                }}
            />

            <Card>
                <CardHeader><CardTitle>Role Metadata</CardTitle></CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Value label="Company" value={jobDescription.company} />
                    <Value label="Location" value={jobDescription.location} />
                    <Value label="Experience" value={jobDescription.experienceRequirements} />
                    <Value label="Source URL" value={jobDescription.sourceUrl} link />
                    <Value label="Created" value={jobDescription.createdAt.toLocaleDateString()} />
                    <Value label="Updated" value={jobDescription.updatedAt.toLocaleDateString()} />
                </CardContent>
            </Card>

            <section className="space-y-5">
                <h2 className="text-2xl font-semibold">Immutable Snapshots</h2>
                {jobDescription.snapshots.map((snapshot) => {
                    const keywords = Array.isArray(snapshot.parsedKeywords)
                        ? snapshot.parsedKeywords
                        : [];
                    return (
                        <Card key={snapshot.id}>
                            <CardHeader className="flex-row items-center justify-between gap-3">
                                <CardTitle>Snapshot {snapshot.snapshotNumber}</CardTitle>
                                <Badge variant="outline">{snapshot.createdAt.toLocaleString()}</Badge>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="flex flex-wrap gap-2">
                                    {keywords.slice(0, 20).map((value, index) => {
                                        const keyword =
                                            typeof value === "object" && value !== null && "keyword" in value
                                                ? String(value.keyword)
                                                : null;
                                        return keyword ? <Badge key={`${keyword}-${index}`} variant="secondary">{keyword}</Badge> : null;
                                    })}
                                </div>
                                <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-muted p-4 text-sm">
                                    {snapshot.rawText}
                                </pre>
                                <p className="text-xs text-muted-foreground">
                                    References: {snapshot._count.matchResults} matches, {snapshot._count.resumeVersions} resume versions, {snapshot._count.applications} applications, {snapshot._count.aiSuggestions} AI suggestions
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>
        </main>
    );
}

function Value({ label, value, link = false }: { label: string; value: string | null; link?: boolean }) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {link && value ? (
                <a className="break-all underline-offset-4 hover:underline" href={value} target="_blank" rel="noreferrer">{value}</a>
            ) : (
                <p>{value || "Not specified"}</p>
            )}
        </div>
    );
}
