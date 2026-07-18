import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    resumes: {
        id: string;
        title: string;
        versionNumber: number;
        status: string;
    }[];
}

export function RecentResumes({ resumes }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Resume Versions</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {resumes.map((resume) => (
                    <div
                        key={resume.id}
                        className="flex justify-between">
                        <div>
                            <p className="font-medium">{resume.title}</p>

                            <p className="text-sm text-muted-foreground">
                                Version {resume.versionNumber}
                            </p>
                        </div>

                        <span className="text-sm">{resume.status}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
