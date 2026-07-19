"use client";

import { ApplicationStatus } from "@prisma/client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ApplicationCard, type TrackedApplication } from "./application-card";

const columns: { status: ApplicationStatus; label: string; tone: string }[] = [
    { status: ApplicationStatus.SAVED, label: "Saved", tone: "border-t-slate-400" },
    { status: ApplicationStatus.APPLIED, label: "Applied", tone: "border-t-blue-500" },
    { status: ApplicationStatus.OA, label: "Assessment", tone: "border-t-violet-500" },
    { status: ApplicationStatus.INTERVIEW, label: "Interview", tone: "border-t-amber-500" },
    { status: ApplicationStatus.OFFER, label: "Offer", tone: "border-t-emerald-500" },
    { status: ApplicationStatus.REJECTED, label: "Rejected", tone: "border-t-red-500" },
    { status: ApplicationStatus.CLOSED, label: "Closed", tone: "border-t-zinc-500" },
];

export function KanbanBoard({ applications }: { applications: TrackedApplication[] }) {
    const router = useRouter();
    const [items, setItems] = useState(applications);
    const [error, setError] = useState<string | null>(null);
    const grouped = useMemo(
        () => new Map(columns.map(({ status }) => [status, items.filter((item) => item.status === status)])),
        [items],
    );

    async function update(id: string, changes: Record<string, unknown>) {
        setError(null);
        const previous = items;
        setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } as TrackedApplication : item));
        const response = await fetch(`/api/applications/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changes),
        });
        if (!response.ok) {
            setItems(previous);
            const body = await response.json().catch(() => ({})) as { message?: string };
            setError(body.message || "Unable to update application.");
            return;
        }
        const updated = await response.json() as TrackedApplication;
        setItems((current) => current.map((item) => item.id === id ? { ...item, ...updated } : item));
        router.refresh();
    }

    async function remove(id: string) {
        if (!window.confirm("Delete this application and its status history?")) return;
        const response = await fetch(`/api/applications/${id}`, { method: "DELETE" });
        if (response.ok) {
            setItems((current) => current.filter((item) => item.id !== id));
            router.refresh();
        } else setError("Unable to delete application.");
    }

    return (
        <section className="space-y-4">
            {error ? <p role="alert" className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
            <div className="flex snap-x gap-4 overflow-x-auto pb-4">
                {columns.map((column) => (
                    <div key={column.status} className={`min-h-96 w-72 shrink-0 snap-start border border-t-4 bg-muted/20 p-3 ${column.tone}`}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">{column.label}</h2>
                            <span className="border bg-background px-2 py-0.5 text-xs text-muted-foreground">{grouped.get(column.status)?.length ?? 0}</span>
                        </div>
                        <div className="space-y-3">
                            {grouped.get(column.status)?.map((item) => (
                                <ApplicationCard key={item.id} application={item} statuses={columns} onUpdate={update} onDelete={remove} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
