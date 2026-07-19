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
        sourceFormat === "LATEX" ||
        (sourceFormat === "PDF" &&
            fileMimeType?.toLowerCase() === "application/pdf");

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
