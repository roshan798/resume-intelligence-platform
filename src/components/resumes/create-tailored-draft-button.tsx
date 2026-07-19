"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function CreateTailoredDraftButton({ matchResultId }: { matchResultId: string }) {
    const router = useRouter();
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function createDraft() {
        setIsBusy(true);
        setError(null);
        try {
            const response = await fetch(`/api/matches/${matchResultId}/tailored-draft`, { method: "POST" });
            const body = await response.json() as { id?: string; resumeId?: string; message?: string };
            if (!response.ok || !body.id || !body.resumeId) throw new Error(body.message || "Unable to create tailored draft.");
            router.push(`/resumes/${body.resumeId}/versions/${body.id}`);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to create tailored draft.");
        } finally {
            setIsBusy(false);
        }
    }

    return (
        <div className="space-y-2">
            <Button onClick={createDraft} disabled={isBusy}>
                {isBusy ? "Creating draft…" : "Create LaTeX tailored draft"}
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
