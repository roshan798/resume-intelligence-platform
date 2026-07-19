import Link from "next/link";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-3">
                <Button asChild>
                    <Link href="/resumes">Upload Resume</Link>
                </Button>

                <Button
                    variant="secondary"
                    asChild>
                    <Link href="/job-descriptions/new">Add Job Description</Link>
                </Button>

                <Button
                    variant="outline"
                    asChild>
                    <Link href="/ai/draft">Generate Draft</Link>
                </Button>

                <Button
                    variant="outline"
                    asChild>
                    <Link href="/applications">Applications</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
