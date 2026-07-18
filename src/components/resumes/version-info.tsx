import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    version: {
        sourceFormat: string;
        createdAt: Date | string;
        updatedAt: Date | string;
        parent?: {
            versionNumber: number;
        } | null;
        matchResults: unknown[];
    };
}

export function VersionInfo({ version }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Version Information</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Source Format
                    </p>

                    <p>{version.sourceFormat}</p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Matches</p>

                    <p>{version.matchResults.length}</p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Created</p>

                    <p>{new Date(version.createdAt).toLocaleString()}</p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Updated</p>

                    <p>{new Date(version.updatedAt).toLocaleString()}</p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Parent</p>

                    <p>
                        {version.parent
                            ? `Version ${version.parent.versionNumber}`
                            : "None"}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
