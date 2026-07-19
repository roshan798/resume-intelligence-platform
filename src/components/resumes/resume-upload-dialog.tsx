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

    async function upload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!file || title.trim().length < 3) return;

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
            <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="latex-style-file">
                    Optional LaTeX style (.cls or .sty)
                </label>
                <Input
                    id="latex-style-file"
                    type="file"
                    accept=".cls,.sty"
                    onChange={(event) => setStyleFile(event.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                    Used only with a .tex resume. For example, upload resume.cls with a document that uses \\documentclass{'{resume}'}.
                </p>
            </div>
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
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />

            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}

            <Button
                type="submit"
                disabled={loading || !file || title.trim().length < 3}
            >
                {loading ? "Uploading and parsing..." : "Upload Resume"}
            </Button>
        </form>
    );
}
