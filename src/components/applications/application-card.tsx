"use client";

import { ApplicationStatus } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export interface TrackedApplication {
    id: string;
    company: string;
    roleTitle: string;
    status: ApplicationStatus;
    appliedDate: string | Date | null;
    applicationUrl: string | null;
    location: string | null;
    nextAction: string | null;
    nextActionDate: string | Date | null;
    notes: string | null;
    updatedAt: string | Date;
    resumeVersion: { id: string; versionNumber: number; resume: { id: string; title: string } };
    jdAnalysis: { id: string; jobDescriptionId: string | null } | null;
}

export function ApplicationCard({ application, statuses, onUpdate, onDelete }: {
    application: TrackedApplication;
    statuses: { status: ApplicationStatus; label: string }[];
    onUpdate: (id: string, changes: Record<string, unknown>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}) {
    const [editing, setEditing] = useState(false);
    const [notes, setNotes] = useState(application.notes ?? "");
    const [nextAction, setNextAction] = useState(application.nextAction ?? "");
    const [nextActionDate, setNextActionDate] = useState(toInputDate(application.nextActionDate));

    return (
        <article className="space-y-3 border bg-background p-4 shadow-sm">
            <div>
                <p className="font-semibold leading-tight">{application.company}</p>
                <p className="mt-1 text-sm text-muted-foreground">{application.roleTitle}</p>
                {application.location ? <p className="mt-1 text-xs text-muted-foreground">{application.location}</p> : null}
            </div>
            <select aria-label={`Status for ${application.roleTitle}`} value={application.status} onChange={(event) => onUpdate(application.id, { status: event.target.value })} className="h-9 w-full border bg-background px-2 text-xs">
                {statuses.map((item) => <option key={item.status} value={item.status}>{item.label}</option>)}
            </select>
            {application.nextAction ? (
                <div className="border-l-2 border-amber-500 pl-2 text-xs">
                    <p>{application.nextAction}</p>
                    {application.nextActionDate ? <p className="text-muted-foreground">Due {formatDate(application.nextActionDate)}</p> : null}
                </div>
            ) : null}
            <p className="text-xs text-muted-foreground">{application.resumeVersion.resume.title} · V{application.resumeVersion.versionNumber}</p>
            <div className="flex flex-wrap gap-2 text-xs">
                {application.applicationUrl ? <a className="underline" href={application.applicationUrl} target="_blank" rel="noreferrer">Job link</a> : null}
                <Link className="underline" href={`/resumes/${application.resumeVersion.resume.id}/versions/${application.resumeVersion.id}`}>Resume</Link>
                {application.jdAnalysis?.jobDescriptionId ? <Link className="underline" href={`/job-descriptions/${application.jdAnalysis.jobDescriptionId}`}>JD</Link> : null}
            </div>
            <Button type="button" size="xs" variant="outline" onClick={() => setEditing((value) => !value)}>{editing ? "Close" : "Details"}</Button>
            {editing ? (
                <div className="space-y-2 border-t pt-3">
                    <input value={nextAction} onChange={(event) => setNextAction(event.target.value)} placeholder="Next action" className="h-9 w-full border bg-background px-2 text-sm" />
                    <input type="date" value={nextActionDate} onChange={(event) => setNextActionDate(event.target.value)} className="h-9 w-full border bg-background px-2 text-sm" />
                    <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes" rows={4} className="w-full resize-y border bg-background p-2 text-sm" />
                    <div className="flex gap-2">
                        <Button size="xs" onClick={() => onUpdate(application.id, { notes, nextAction, nextActionDate })}>Save</Button>
                        <Button size="xs" variant="destructive" onClick={() => onDelete(application.id)}>Delete</Button>
                    </div>
                </div>
            ) : null}
        </article>
    );
}

function toInputDate(value: string | Date | null): string {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value: string | Date): string {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}
