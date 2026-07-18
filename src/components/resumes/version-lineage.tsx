import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    versions: {
        id: string;
        versionNumber: number;
        status: string;
    }[];
    resumeId: string;
}

export function VersionLineage({ versions, resumeId }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Version Lineage</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                {versions.map((version) => (
                    <Link
                        key={version.id}
                        href={`/resumes/${resumeId}/versions/${version.id}`}
                        className="flex items-center justify-between rounded border p-3 hover:bg-muted">
                        <span>Version {version.versionNumber}</span>

                        <Badge>{version.status}</Badge>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}
