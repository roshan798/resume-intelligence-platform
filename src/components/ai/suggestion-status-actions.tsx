"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function SuggestionStatusActions({
    id,
    status = "PROPOSED",
}: {
    id: string;
    status?: "PROPOSED" | "ACCEPTED";
}) {
    const router = useRouter();
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function update(status: "ACCEPTED" | "REJECTED" | "MANUALLY_APPLIED") {
        setIsBusy(true);
        setError(null);
        try {
            const response = await fetch(`/api/ai/suggestions/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const body = (await response.json()) as { message?: string };
            if (!response.ok) throw new Error(body.message || "Unable to update suggestion.");
            router.refresh();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to update suggestion.");
        } finally {
            setIsBusy(false);
        }
    }

    return (
        <div className="space-y-2">
            {status === "PROPOSED" ? (
                <div className="flex gap-2">
                    <Button disabled={isBusy} onClick={() => update("ACCEPTED")}>Accept</Button>
                    <Button disabled={isBusy} variant="outline" onClick={() => update("REJECTED")}>Reject</Button>
                </div>
            ) : (
                <Button disabled={isBusy} variant="outline" onClick={() => update("MANUALLY_APPLIED")}>Mark manually applied</Button>
            )}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
