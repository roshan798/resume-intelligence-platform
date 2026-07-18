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
    const canPreview =
        sourceFormat === "PDF" && fileMimeType?.toLowerCase() === "application/pdf";

    return (
        <Card>
            <CardHeader>
                <CardTitle>PDF Preview</CardTitle>
            </CardHeader>
            <CardContent>
                {canPreview ? (
                    <iframe
                        className="h-[70vh] min-h-96 w-full rounded-md border bg-muted"
                        src={`/api/resumes/versions/${encodeURIComponent(versionId)}/preview`}
                        title="Resume PDF preview"
                    />
                ) : (
                    <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                        PDF preview is unavailable for this version. Use the raw text
                        or LaTeX view below instead.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
