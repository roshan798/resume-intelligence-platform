import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
    version: {
        id: string;
        versionNumber: number;
        status: string;
        createdAt: Date | string;
        resume: {
            id: string;
            title: string;
        };
    };
}

export function VersionHeader({ version }: Props) {
    return (
        <div className="space-y-4">
            <Button
                asChild
                variant="outline">
                <Link href={`/resumes/${version.resume.id}`}>
                    ← Back to Resume
                </Link>
            </Button>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        {version.resume.title}
                    </h1>

                    <p className="text-muted-foreground">
                        Version {version.versionNumber}
                    </p>
                </div>

                <Badge>{version.status}</Badge>
            </div>
        </div>
    );
}
