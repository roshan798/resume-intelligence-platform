"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CreateApplicationButton({ matchResultId }: { matchResultId: string }) {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    async function create() {
        setPending(true); setError(null);
        const response = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchResultId }) });
        if (!response.ok) { const body = await response.json().catch(() => ({})) as { message?: string }; setError(body.message || "Unable to save application."); setPending(false); return; }
        router.push("/applications"); router.refresh();
    }
    return <div className="space-y-2"><Button type="button" onClick={create} disabled={pending}>{pending ? "Saving..." : "Track this application"}</Button>{error ? <p className="text-sm text-destructive">{error}</p> : null}</div>;
}
