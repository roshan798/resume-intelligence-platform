import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResumeCardProps {
    resume: {
        id: string;
        title: string;
        primaryStack: string | null;
        createdAt: Date;
        updatedAt: Date;
        versionCount: number;
        latestVersion: {
            id: string;
            versionNumber: number;
            status: string;
            createdAt: Date;
            matchCount: number;
        } | null;
    };
}

export function ResumeCard({ resume }: ResumeCardProps) {
    return (
        <Link href={`/resumes/${resume.id}`}>
            <Card className="transition hover:border-primary">
                <CardHeader>
                    <CardTitle>{resume.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Badge>{resume.primaryStack ?? "General"}</Badge>

                        {resume.latestVersion && (
                            <Badge variant="secondary">
                                v{resume.latestVersion.versionNumber}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{resume.versionCount} version(s)</span>

                        {resume.latestVersion && (
                            <span>
                                {resume.latestVersion.matchCount} matches
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Updated{" "}
                        {new Date(resume.updatedAt).toLocaleDateString()}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
