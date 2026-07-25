"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResumePdfPreviewProps {
    versionId: string;
    sourceFormat: string;
    fileMimeType?: string | null;
}

export function ResumePdfPreview({
    versionId,
    sourceFormat,
    fileMimeType,
}: ResumePdfPreviewProps) {
    const [revision, setRevision] = useState(0);
    const canPreview =
        sourceFormat === "LATEX" ||
        (sourceFormat === "PDF" &&
            fileMimeType?.toLowerCase() === "application/pdf");

    useEffect(() => {
        const reload = (event: Event) => {
            const detail = (event as CustomEvent<{ versionId?: string }>).detail;
            if (!detail?.versionId || detail.versionId === versionId) {
                setRevision((value) => value + 1);
            }
        };
        window.addEventListener("latex-preview-updated", reload);
        return () => window.removeEventListener("latex-preview-updated", reload);
    }, [versionId]);

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>PDF Preview</CardTitle>
                {canPreview ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRevision((value) => value + 1)}
                    >
                        Refresh preview
                    </Button>
                ) : null}
            </CardHeader>
            <CardContent>
                {canPreview ? (
                    <iframe
                        className="h-[70vh] min-h-96 w-full rounded-md border bg-muted"
                        src={`/api/resumes/versions/${encodeURIComponent(versionId)}/preview?revision=${revision}`}
                        title={sourceFormat === "LATEX" ? "Compiled LaTeX resume preview" : "Resume PDF preview"}
                    />
                ) : (
                    <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                        PDF preview is unavailable for this version. Upload a PDF or a
                        compilable LaTeX source with its required .cls/.sty file.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
