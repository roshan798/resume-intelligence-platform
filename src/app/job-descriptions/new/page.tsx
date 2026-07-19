import Link from "next/link";

import { JobDescriptionCreateForm } from "@/components/job-descriptions/job-description-create-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewJobDescriptionPage() {
    return (
        <main className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">New Job Description</h1>
                    <p className="mt-2 text-muted-foreground">
                        Save role metadata and create the first immutable text snapshot.
                    </p>
                </div>
                <Button asChild variant="outline"><Link href="/job-descriptions">Back</Link></Button>
            </div>
            <Card>
                <CardHeader><CardTitle>Role and source</CardTitle></CardHeader>
                <CardContent><JobDescriptionCreateForm /></CardContent>
            </Card>
        </main>
    );
}
