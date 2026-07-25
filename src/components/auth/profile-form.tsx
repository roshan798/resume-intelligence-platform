"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileForm({ initialName }: { initialName: string }) {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setError(null);
        setSaved(false);

        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            const payload = (await response.json().catch(() => null)) as {
                message?: string;
                errors?: { name?: string[] };
            } | null;
            if (!response.ok) {
                throw new Error(payload?.errors?.name?.[0] ?? payload?.message ?? "Unable to save profile.");
            }
            setSaved(true);
            router.refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Unable to save profile.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-5">
            <label className="grid gap-2 text-sm font-medium" htmlFor="profile-name">
                Display name
                <Input
                    id="profile-name"
                    name="name"
                    value={name}
                    minLength={2}
                    maxLength={80}
                    required
                    autoComplete="name"
                    onChange={(event) => {
                        setName(event.target.value);
                        setSaved(false);
                    }}
                />
            </label>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            {saved ? (
                <p role="status" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 aria-hidden="true" className="size-4" />
                    Profile updated.
                </p>
            ) : null}
            <Button type="submit" disabled={isSaving || name.trim() === initialName.trim()}>
                {isSaving ? "Saving…" : "Save profile"}
            </Button>
        </form>
    );
}
