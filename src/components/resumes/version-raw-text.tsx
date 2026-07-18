import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VersionRawTextProps {
    rawText: string;
    latexSource: string | null;
}

export function VersionRawText({ rawText, latexSource }: VersionRawTextProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Raw Resume Text</CardTitle>
                </CardHeader>

                <CardContent>
                    {rawText.trim().length > 0 ? (
                        <pre className="max-h-160 overflow-auto whitespace-pre-wrap border bg-muted/30 p-4 font-mono text-sm">
                            {rawText}
                        </pre>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No parsed resume text is available.
                        </p>
                    )}
                </CardContent>
            </Card>

            {latexSource && (
                <Card>
                    <CardHeader>
                        <CardTitle>LaTeX Source</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <pre className="max-h-160 overflow-auto whitespace-pre-wrap border bg-muted/30 p-4 font-mono text-sm">
                            {latexSource}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
