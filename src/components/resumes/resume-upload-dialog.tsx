"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResumeUploadDialog() {
    const [title, setTitle] = useState("");
    const [primaryStack, setPrimaryStack] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    async function upload() {
        if (!file || !title) return;

        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("title", title);
            formData.append("primaryStack", primaryStack);
            formData.append("file", file);

            const response = await fetch("/api/resumes", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error();
            }

            window.location.reload();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-lg border p-6 space-y-4">
            <Input
                placeholder="Resume title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <Input
                placeholder="Primary Stack (Spring Boot, MERN...)"
                value={primaryStack}
                onChange={(e) => setPrimaryStack(e.target.value)}
            />

            <Input
                type="file"
                accept=".pdf,.docx,.tex"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <Button
                onClick={upload}
                disabled={loading}>
                {loading ? "Uploading..." : "Upload Resume"}
            </Button>
        </div>
    );
}
