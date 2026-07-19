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
            const response = await fetch("/api/ai/suggestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matchResultId }),
            });
            const body = (await response.json()) as { message?: string };
            if (!response.ok) throw new Error(body.message || "Suggestion generation failed.");
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
