"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function GenerateMatchSuggestionsButton({ matchResultId }: { matchResultId: string }) {
    const router = useRouter();
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function generate() {
        setIsBusy(true);
        setError(null);
        try {
            const response = await fetch("/api/ai/suggestions/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matchResultId }),
            });
            const body = (await response.json()) as { message?: string; jobId?: string };
            if (!response.ok) throw new Error(body.message || "Suggestion generation failed.");
            if (!body.jobId) throw new Error("The background job was not created.");
            await waitForJob(body.jobId);
            router.push("/ai/suggestions");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Suggestion generation failed.");
        } finally {
            setIsBusy(false);
        }
    }

    return (
        <div className="space-y-2">
            <Button onClick={generate} disabled={isBusy}>
                {isBusy ? "Generating safely…" : "Generate AI suggestions"}
            </Button>
            {error ? <p className="max-w-md text-sm text-destructive">{error}</p> : null}
        </div>
    );
}

async function waitForJob(jobId: string) {
    for (let attempt = 0; attempt < 60; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        const response = await fetch(`/api/background-jobs/${jobId}`, { cache: "no-store" });
        const job = await response.json() as { status?: string; error?: string };
        if (job.status === "COMPLETED") return;
        if (job.status === "FAILED") throw new Error(job.error || "Suggestion generation failed.");
    }
    throw new Error("Suggestion generation is still running. Check the suggestions page shortly.");
}
