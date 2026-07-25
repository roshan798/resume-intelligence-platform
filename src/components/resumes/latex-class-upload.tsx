"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LatexClassUpload({
    versionId,
    currentFilename,
}: {
    versionId: string;
    currentFilename: string | null;
}) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    async function replaceClass(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!file) return;
        setBusy(true);
        setError(null);
        setMessage(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch(
                `/api/resumes/versions/${encodeURIComponent(versionId)}/style`,
                { method: "PUT", body: formData },
            );
            const body = (await response.json()) as {
                message?: string;
                latexStyleFilename?: string;
            };
            if (!response.ok) {
                throw new Error(body.message || "Unable to replace the CLS file.");
            }
            setMessage(
                `${body.latexStyleFilename || file.name} compiled and saved successfully.`,
            );
            setFile(null);
            window.dispatchEvent(
                new CustomEvent("latex-preview-updated", {
                    detail: { versionId },
                }),
            );
            router.refresh();
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to replace the CLS file.",
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>LaTeX class file</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Current file: {currentFilename || "No class file uploaded"}
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={replaceClass} className="space-y-3">
                    <Input
                        type="file"
                        accept=".cls"
                        required
                        onChange={(event) =>
                            setFile(event.target.files?.[0] ?? null)
                        }
                    />
                    <p className="text-xs text-muted-foreground">
                        Upload the complete replacement .cls file. It will be
                        compiled with this version before it is saved.
                    </p>
                    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
                    {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
                    <Button type="submit" disabled={!file || busy}>
                        {busy ? "Validating and compiling..." : "Replace CLS file"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
