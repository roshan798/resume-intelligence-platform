"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface JobDescriptionActionsProps {
    id: string;
    status: "ACTIVE" | "ARCHIVED";
    metadata: {
        company: string | null;
        roleTitle: string;
        location: string | null;
        sourceUrl: string | null;
        experienceRequirements: string | null;
    };
}

export function JobDescriptionActions({
    id,
    status,
    metadata,
}: JobDescriptionActionsProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingSnapshot, setIsAddingSnapshot] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function updateMetadata(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await request(`/api/job-descriptions/${id}`, "PATCH", {
            company: valueOrNull(form.get("company")),
            roleTitle: form.get("roleTitle"),
            location: valueOrNull(form.get("location")),
            sourceUrl: valueOrNull(form.get("sourceUrl")),
            experienceRequirements: valueOrNull(
                form.get("experienceRequirements"),
            ),
        });
        setIsEditing(false);
    }

    async function addSnapshot(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await request(`/api/job-descriptions/${id}/snapshots`, "POST", {
            rawText: form.get("rawText"),
        });
        setIsAddingSnapshot(false);
    }

    async function setStatus() {
        await request(
            `/api/job-descriptions/${id}/${status === "ACTIVE" ? "archive" : "restore"}`,
            "POST",
        );
    }

    async function deleteJobDescription() {
        if (
            !window.confirm(
                "Permanently delete this job description and its unreferenced snapshots? This cannot be undone.",
            )
        ) {
            return;
        }
        const succeeded = await request(`/api/job-descriptions/${id}`, "DELETE");
        if (succeeded) router.push("/job-descriptions");
    }

    async function request(
        url: string,
        method: "PATCH" | "POST" | "DELETE",
        body?: Record<string, FormDataEntryValue | null>,
    ): Promise<boolean> {
        setIsBusy(true);
        setError(null);
        try {
            const response = await fetch(url, {
                method,
                headers: body ? { "Content-Type": "application/json" } : undefined,
                body: body ? JSON.stringify(body) : undefined,
            });
            const result = (await response.json()) as { message?: string };
            if (!response.ok) {
                throw new Error(result.message || "Operation failed.");
            }
            router.refresh();
            return true;
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Operation failed.",
            );
            return false;
        } finally {
            setIsBusy(false);
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    Edit metadata
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setIsAddingSnapshot(!isAddingSnapshot)}
                >
                    Add snapshot
                </Button>
                <Button variant="outline" disabled={isBusy} onClick={setStatus}>
                    {status === "ACTIVE" ? "Archive" : "Restore"}
                </Button>
                <Button variant="destructive" disabled={isBusy} onClick={deleteJobDescription}>
                    Delete
                </Button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {isEditing && (
                <form onSubmit={updateMetadata} className="grid gap-4 border p-5 sm:grid-cols-2">
                    <InputField name="roleTitle" label="Role title" value={metadata.roleTitle} required />
                    <InputField name="company" label="Company" value={metadata.company} />
                    <InputField name="location" label="Location" value={metadata.location} />
                    <InputField name="sourceUrl" label="Source URL" value={metadata.sourceUrl} type="url" />
                    <div className="sm:col-span-2">
                        <InputField
                            name="experienceRequirements"
                            label="Experience requirements"
                            value={metadata.experienceRequirements}
                        />
                    </div>
                    <Button type="submit" disabled={isBusy}>Save metadata</Button>
                </form>
            )}

            {isAddingSnapshot && (
                <form onSubmit={addSnapshot} className="space-y-4 border p-5">
                    <label htmlFor="snapshot-text" className="text-sm font-medium">
                        New immutable snapshot text
                    </label>
                    <textarea
                        id="snapshot-text"
                        name="rawText"
                        minLength={50}
                        required
                        rows={14}
                        className="w-full resize-y border bg-background p-4 text-sm outline-none focus:border-ring"
                    />
                    <Button type="submit" disabled={isBusy}>Create snapshot</Button>
                </form>
            )}
        </div>
    );
}

function InputField({
    name,
    label,
    value,
    type = "text",
    required = false,
}: {
    name: string;
    label: string;
    value: string | null;
    type?: string;
    required?: boolean;
}) {
    return (
        <label className="space-y-2 text-sm font-medium">
            {label}
            <input
                name={name}
                type={type}
                required={required}
                defaultValue={value ?? ""}
                className="h-10 w-full border-b bg-transparent outline-none focus:border-ring"
            />
        </label>
    );
}

function valueOrNull(value: FormDataEntryValue | null): string | null {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}
