import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeMetadataEditor } from "@/components/resumes/resume-metadata-editor";

import { GetResumeService } from "@/modules/resumes/services/get-resume.service";

interface Props {
    params: Promise<{
        resumeId: string;
    }>;
}

export default async function ResumePage({ params }: Props) {
    const session = await auth();

    if (!session?.user?.id) {
        notFound();
    }

    const { resumeId } = await params;

    const service = new GetResumeService();

    const resume = await service.execute(session.user.id, resumeId);

    if (!resume) {
        notFound();
    }

    return (
        <main className="container mx-auto max-w-6xl space-y-8 p-2 py-8 ">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{resume.title}</h1>

                    <p className="mt-2 text-muted-foreground">
                        {resume.primaryStack ?? "General Resume"}
                    </p>
                </div>

                <Button asChild>
                    <Link href="/resumes">Back</Link>
                </Button>
            </div>

            <ResumeMetadataEditor
                resumeId={resume.id}
                initialTitle={resume.title}
                initialPrimaryStack={resume.primaryStack}
                initialTags={resume.tags}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Resume Information</CardTitle>
                </CardHeader>

                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-muted-foreground">Created</p>

                        <p>{resume.createdAt.toLocaleDateString()}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Updated</p>

                        <p>{resume.updatedAt.toLocaleDateString()}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Total Versions
                        </p>

                        <p>{resume.versions.length}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resume Versions</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {resume.versions.map((version) => (
                        <div
                            key={version.id}
                            className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold">
                                        Version {version.versionNumber}
                                    </h3>

                                    <Badge>{version.status}</Badge>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Created{" "}
                                    {version.createdAt.toLocaleDateString()}
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                asChild>
                                <Link
                                    href={`/resumes/${resume.id}/versions/${version.id}`}>
                                    Open
                                </Link>
                            </Button>
                        </div>
                    ))}

                    {resume.versions.length === 0 && (
                        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                            No versions found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
