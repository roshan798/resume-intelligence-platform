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
                    <Link href="/applications">Track Applications</Link>
                </Button>

                <Button asChild>
                    <Link href="/resumes">Manage Resumes</Link>
                </Button>

                <Button
                    variant="secondary"
                    asChild>
                    <Link href="/job-descriptions/new">Add Job Description</Link>
                </Button>

                <Button
                    variant="outline"
                    asChild>
                    <Link href="/semantic-search">Semantic Search</Link>
                </Button>

                <Button
                    variant="outline"
                    asChild>
                    <Link href="/ai/suggestions">AI Suggestions</Link>
                </Button>

                <Button variant="outline" asChild>
                    <Link href="/settings">AI Settings</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
