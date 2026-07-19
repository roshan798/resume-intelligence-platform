"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JobDescriptionCreateForm() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setError(null);
        const form = new FormData(event.currentTarget);

        try {
            const response = await fetch("/api/job-descriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company: valueOrNull(form.get("company")),
                    roleTitle: form.get("roleTitle"),
                    location: valueOrNull(form.get("location")),
                    sourceUrl: valueOrNull(form.get("sourceUrl")),
                    experienceRequirements: valueOrNull(
                        form.get("experienceRequirements"),
                    ),
                    rawText: form.get("rawText"),
                }),
            });
            const body = (await response.json()) as {
                jobDescription?: { id: string };
                message?: string;
            };

            if (!response.ok || !body.jobDescription?.id) {
                throw new Error(body.message || "Unable to save job description.");
            }

            router.push(`/job-descriptions/${body.jobDescription.id}`);
            router.refresh();
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to save job description.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Role title" name="roleTitle" required />
                <Field label="Company" name="company" />
                <Field label="Location" name="location" />
                <Field label="Source URL" name="sourceUrl" type="url" />
            </div>
            <Field
                label="Experience requirements"
                name="experienceRequirements"
                placeholder="For example: 3–5 years building backend services"
            />
            <div className="space-y-2">
                <label htmlFor="rawText" className="text-sm font-medium">
                    Job description
                </label>
                <textarea
                    id="rawText"
                    name="rawText"
                    required
                    minLength={50}
                    rows={18}
                    className="w-full resize-y border bg-background p-4 text-sm outline-none focus:border-ring"
                    placeholder="Paste the complete job description here..."
                />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save job description"}
            </Button>
        </form>
    );
}

function Field({
    label,
    name,
    type = "text",
    required = false,
    placeholder,
}: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
}) {
    return (
        <div className="space-y-2">
            <label htmlFor={name} className="text-sm font-medium">
                {label}
            </label>
            <Input
                id={name}
                name={name}
                type={type}
                required={required}
                placeholder={placeholder}
            />
        </div>
    );
}

function valueOrNull(value: FormDataEntryValue | null): string | null {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}
