import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VersionInfoProps {
    version: {
        sourceFormat: string;
        createdAt: Date | string;
        updatedAt: Date | string;

        parent?: {
            id: string;
            versionNumber: number;
            status: string;
        } | null;

        _count: {
            matchResults: number;
        };
    };
}

function formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export function VersionInfo({ version }: VersionInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Version Information</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Source format
                    </p>

                    <p className="font-medium">{version.sourceFormat}</p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Created</p>

                    <p className="font-medium">
                        {formatDate(version.createdAt)}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Updated</p>

                    <p className="font-medium">
                        {formatDate(version.updatedAt)}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Matches</p>

                    <p className="font-medium">{version._count.matchResults}</p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Parent version
                    </p>

                    <p className="font-medium">
                        {version.parent
                            ? `Version ${version.parent.versionNumber}`
                            : "None"}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
