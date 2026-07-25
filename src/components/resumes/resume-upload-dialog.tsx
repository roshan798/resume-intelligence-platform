"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UploadResponse {
    resume?: { id: string };
    version?: { id: string };
    message?: string;
}

export function ResumeUploadDialog() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [primaryStack, setPrimaryStack] = useState("");
    const [tags, setTags] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [styleFile, setStyleFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isLatex = file?.name.toLocaleLowerCase().endsWith(".tex") ?? false;

    async function upload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!file || title.trim().length < 3 || (isLatex && !styleFile)) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("primaryStack", primaryStack);
            formData.append("file", file);
            if (styleFile) formData.append("styleFile", styleFile);

            for (const tag of tags.split(",").map((value) => value.trim())) {
                if (tag) formData.append("tags", tag);
            }

            const response = await fetch("/api/resumes", {
                method: "POST",
                body: formData,
            });
            const body = (await response.json()) as UploadResponse;

            if (!response.ok || !body.resume?.id || !body.version?.id) {
                throw new Error(body.message || "Unable to upload the resume.");
            }

            router.push(
                `/resumes/${body.resume.id}/versions/${body.version.id}`,
            );
            router.refresh();
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to upload the resume.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={upload} className="space-y-4 rounded-lg border p-6">
            <Input
                placeholder="Resume title"
                value={title}
                maxLength={100}
                required
                onChange={(event) => setTitle(event.target.value)}
            />
            <Input
                placeholder="Primary Stack (Spring Boot, MERN...)"
                value={primaryStack}
                maxLength={100}
                onChange={(event) => setPrimaryStack(event.target.value)}
            />
            <Input
                placeholder="Tags (backend, java, fintech)"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
            />
            <Input
                type="file"
                accept=".pdf,.docx,.tex"
                required
                onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setFile(nextFile);
                    if (!nextFile?.name.toLocaleLowerCase().endsWith(".tex")) {
                        setStyleFile(null);
                    }
                }}
            />
            {isLatex ? (
                <div className="space-y-1 rounded border border-primary/30 bg-primary/5 p-4">
                    <label className="text-sm font-medium" htmlFor="latex-style-file">
                        LaTeX class file (.cls) — required
                    </label>
                    <Input
                        id="latex-style-file"
                        type="file"
                        accept=".cls"
                        required
                        onChange={(event) => setStyleFile(event.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Upload the complete class file referenced by the resume,
                        such as resume.cls for \\documentclass{'{resume}'}.
                    </p>
                </div>
            ) : null}

            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}

            <Button
                type="submit"
                disabled={
                    loading ||
                    !file ||
                    title.trim().length < 3 ||
                    (isLatex && !styleFile)
                }
            >
                {loading ? "Uploading and parsing..." : "Upload Resume"}
            </Button>
        </form>
    );
}
