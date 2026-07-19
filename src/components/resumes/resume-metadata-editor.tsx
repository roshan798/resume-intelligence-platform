"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ResumeMetadataEditorProps {
    resumeId: string;
    initialTitle: string;
    initialPrimaryStack: string | null;
    initialTags: string[];
}

export function ResumeMetadataEditor({
    resumeId,
    initialTitle,
    initialPrimaryStack,
    initialTags,
}: ResumeMetadataEditorProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialTitle);
    const [primaryStack, setPrimaryStack] = useState(initialPrimaryStack ?? "");
    const [tagsInput, setTagsInput] = useState(initialTags.join(", "));
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .filter((tag, index, values) => values.indexOf(tag) === index);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/resumes/${resumeId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    primaryStack: primaryStack.trim() || null,
                    tags,
                }),
            });
            const body = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(body.message || "Unable to update resume.");
            }

            setIsEditing(false);
            router.refresh();
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to update resume.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    function cancelEditing() {
        setTitle(initialTitle);
        setPrimaryStack(initialPrimaryStack ?? "");
        setTagsInput(initialTags.join(", "));
        setError(null);
        setIsEditing(false);
    }

    if (!isEditing) {
        return (
            <Card>
                <CardHeader className="flex-row items-center justify-between gap-4">
                    <CardTitle>Resume Metadata</CardTitle>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Edit
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <MetadataValue label="Title" value={initialTitle} />
                        <MetadataValue
                            label="Primary stack"
                            value={initialPrimaryStack || "Not specified"}
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Tags</p>
                        <div className="flex flex-wrap gap-2">
                            {initialTags.length > 0 ? (
                                initialTags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm">No tags</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Resume Metadata</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label htmlFor="resume-title" className="text-sm font-medium">
                            Title
                        </label>
                        <Input
                            id="resume-title"
                            value={title}
                            maxLength={100}
                            required
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="primary-stack" className="text-sm font-medium">
                            Primary stack
                        </label>
                        <Input
                            id="primary-stack"
                            value={primaryStack}
                            maxLength={100}
                            onChange={(event) => setPrimaryStack(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="resume-tags" className="text-sm font-medium">
                            Tags
                        </label>
                        <Input
                            id="resume-tags"
                            value={tagsInput}
                            onChange={(event) => setTagsInput(event.target.value)}
                            placeholder="backend, java, fintech"
                        />
                        <p className="text-xs text-muted-foreground">
                            Separate up to 10 tags with commas. Each tag may contain up
                            to 30 characters.
                        </p>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            disabled={isSaving || title.trim().length < 3 || tags.length > 10}
                        >
                            {isSaving ? "Saving..." : "Save changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={cancelEditing}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function MetadataValue({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}
