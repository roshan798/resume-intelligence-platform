"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface VersionEditorProps {
    versionId: string;
    initialRawText: string;
    initialLatexSource: string | null;
}

interface UpdateVersionResponse {
    id: string;
    rawText: string;
    latexSource: string | null;
    updatedAt: string;
}

export function VersionEditor({
    versionId,
    initialRawText,
    initialLatexSource,
}: VersionEditorProps) {
    const router = useRouter();

    const [rawText, setRawText] = useState(initialRawText);
    const [latexSource, setLatexSource] = useState(initialLatexSource ?? "");

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSaving(true);
        setError(null);
        setMessage(null);

        try {
            const response = await fetch(`/api/resumes/versions/${versionId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rawText,
                    latexSource:
                        latexSource.trim().length > 0 ? latexSource : null,
                }),
            });

            const body = (await response.json()) as
                | UpdateVersionResponse
                | {
                      message?: string;
                  };

            if (!response.ok) {
                throw new Error(
                    "message" in body && body.message
                        ? body.message
                        : "Failed to update resume version.",
                );
            }

            setMessage("Draft saved successfully.");

            router.refresh();
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Failed to update resume version.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    function resetEditor() {
        setRawText(initialRawText);
        setLatexSource(initialLatexSource ?? "");
        setError(null);
        setMessage(null);
    }

    const hasChanges =
        rawText !== initialRawText ||
        latexSource !== (initialLatexSource ?? "");

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-lg border p-6">
            <div>
                <h2 className="text-xl font-semibold">Edit Draft</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Update the raw resume text or LaTeX source before finalizing
                    this version.
                </p>
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="rawText"
                    className="text-sm font-medium">
                    Resume text
                </label>

                <textarea
                    id="rawText"
                    value={rawText}
                    onChange={(event) => setRawText(event.target.value)}
                    rows={18}
                    className="w-full resize-y border bg-background p-4 font-mono text-sm outline-none focus:border-ring"
                    placeholder="Resume text"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="latexSource"
                    className="text-sm font-medium">
                    LaTeX source
                </label>

                <textarea
                    id="latexSource"
                    value={latexSource}
                    onChange={(event) => setLatexSource(event.target.value)}
                    rows={18}
                    className="w-full resize-y border bg-background p-4 font-mono text-sm outline-none focus:border-ring"
                    placeholder="Optional LaTeX source"
                />
            </div>

            {error && (
                <p
                    role="alert"
                    className="text-sm text-destructive">
                    {error}
                </p>
            )}

            {message && <p className="text-sm text-green-600">{message}</p>}

            <div className="flex flex-wrap gap-3">
                <Button
                    type="submit"
                    disabled={isSaving || !hasChanges}>
                    {isSaving ? "Saving..." : "Save Draft"}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving || !hasChanges}
                    onClick={resetEditor}>
                    Reset
                </Button>
            </div>
        </form>
    );
}
