"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface VersionActionsProps {
    versionId: string;
    resumeId: string;
    status: string;
    hasRawText: boolean;
    hasLatexSource: boolean;
}

interface ForkVersionResponse {
    id: string;
}

interface DeleteVersionResponse {
    resumeId: string;
    deletedVersionId: string;
}

interface ErrorResponse {
    message?: string;
}

type VersionAction = "fork" | "finalize" | "archive" | "delete";

export function VersionActions({
    versionId,
    resumeId,
    status,
    hasRawText,
    hasLatexSource,
}: VersionActionsProps) {
    const router = useRouter();

    const [pendingAction, setPendingAction] = useState<VersionAction | null>(
        null,
    );

    const [error, setError] = useState<string | null>(null);

    async function readResponseBody(
        response: Response,
    ): Promise<ForkVersionResponse | DeleteVersionResponse | ErrorResponse> {
        try {
            return (await response.json()) as
                | ForkVersionResponse
                | DeleteVersionResponse
                | ErrorResponse;
        } catch {
            return {};
        }
    }

    async function runVersionAction(action: Exclude<VersionAction, "delete">) {
        setPendingAction(action);
        setError(null);

        try {
            const response = await fetch(
                `/api/resumes/versions/${versionId}/${action}`,
                {
                    method: "POST",
                },
            );

            const body = await readResponseBody(response);

            if (!response.ok) {
                throw new Error(
                    "message" in body && body.message
                        ? body.message
                        : `Failed to ${action} resume version.`,
                );
            }

            if (
                action === "fork" &&
                "id" in body &&
                typeof body.id === "string"
            ) {
                router.push(`/resumes/${resumeId}/versions/${body.id}`);

                return;
            }

            router.refresh();
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : `Failed to ${action} resume version.`,
            );
        } finally {
            setPendingAction(null);
        }
    }

    async function deleteVersion() {
        const confirmed = window.confirm(
            "Delete this resume version permanently? This action cannot be undone.",
        );

        if (!confirmed) {
            return;
        }

        setPendingAction("delete");
        setError(null);

        try {
            const response = await fetch(`/api/resumes/versions/${versionId}`, {
                method: "DELETE",
            });

            const body = await readResponseBody(response);

            if (!response.ok) {
                throw new Error(
                    "message" in body && body.message
                        ? body.message
                        : "Failed to delete resume version.",
                );
            }

            router.push(`/resumes/${resumeId}`);
            router.refresh();
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Failed to delete resume version.",
            );
        } finally {
            setPendingAction(null);
        }
    }

    const isArchived = status === "ARCHIVED";
    const isFinal = status === "FINAL";
    const isDraft = status === "TAILORED_DRAFT";

    const canDelete = isDraft || isArchived;
    const isPending = pendingAction !== null;

    return (
        <section className="space-y-3">
            <div className="flex flex-wrap gap-3">
                {hasRawText && (
                    <Button
                        type="button"
                        variant="outline"
                        asChild>
                        <a
                            href={`/api/resumes/versions/${versionId}/download?format=txt`}>
                            Download TXT
                        </a>
                    </Button>
                )}

                {hasLatexSource && (
                    <Button
                        type="button"
                        variant="outline"
                        asChild>
                        <a
                            href={`/api/resumes/versions/${versionId}/download?format=tex`}>
                            Download LaTeX
                        </a>
                    </Button>
                )}

                {!isArchived && (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => runVersionAction("fork")}>
                        {pendingAction === "fork"
                            ? "Forking..."
                            : "Fork Version"}
                    </Button>
                )}

                {isDraft && (
                    <Button
                        type="button"
                        disabled={isPending}
                        onClick={() => runVersionAction("finalize")}>
                        {pendingAction === "finalize"
                            ? "Finalizing..."
                            : "Finalize"}
                    </Button>
                )}

                {!isArchived && !isFinal && (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => runVersionAction("archive")}>
                        {pendingAction === "archive"
                            ? "Archiving..."
                            : "Archive"}
                    </Button>
                )}

                {canDelete && (
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={isPending}
                        onClick={deleteVersion}>
                        {pendingAction === "delete"
                            ? "Deleting..."
                            : "Delete Version"}
                    </Button>
                )}
            </div>

            {error && (
                <p
                    role="alert"
                    className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </section>
    );
}
