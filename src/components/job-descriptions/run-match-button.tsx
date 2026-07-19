"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function RunMatchButton({
    snapshotId,
    hasResults,
}: {
    snapshotId: string;
    hasResults: boolean;
}) {
    const router = useRouter();
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function runMatch() {
        setIsRunning(true);
        setError(null);
        try {
            const response = await fetch(`/api/match/${snapshotId}`, {
                method: "POST",
            });
            const body = (await response.json()) as {
                count?: number;
                message?: string;
            };
            if (!response.ok) {
                throw new Error(body.message || "Unable to run matching.");
            }
            router.push(`/match-results/${snapshotId}`);
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to run matching.",
            );
        } finally {
            setIsRunning(false);
        }
    }

    return (
        <div className="space-y-2">
            <Button onClick={runMatch} disabled={isRunning}>
                {isRunning
                    ? "Matching resumes…"
                    : hasResults
                      ? "Run match again"
                      : "Run match"}
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
