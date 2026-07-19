import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Props {
    applications: {
        id: string;
        company: string;
        roleTitle: string;
        status: string;
    }[];
}

export function RecentApplications({ applications }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {applications.length === 0 ? <p className="text-sm text-muted-foreground">No tracked applications yet.</p> : null}
                {applications.map((application) => (
                    <div
                        key={application.id}
                        className="flex justify-between">
                        <div>
                            <p className="font-medium">{application.company}</p>

                            <p className="text-sm text-muted-foreground">
                                {application.roleTitle}
                            </p>
                        </div>

                        <span className="text-xs uppercase tracking-wider text-muted-foreground">{application.status}</span>
                    </div>
                ))}
                <Link href="/applications" className="inline-block text-sm font-medium underline underline-offset-4">View full pipeline</Link>
            </CardContent>
        </Card>
    );
}
