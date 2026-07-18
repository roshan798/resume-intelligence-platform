import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

                        <span>{application.status}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
