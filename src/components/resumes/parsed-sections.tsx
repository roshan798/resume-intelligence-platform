import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    parsedSections: Record<string, unknown> | null;
}

export function ParsedSections({ parsedSections }: Props) {
    if (!parsedSections) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Parsed Sections</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {Object.entries(parsedSections).map(([key, value]) => (
                    <div key={key}>
                        <h3 className="mb-2 font-semibold capitalize">{key}</h3>

                        <pre className="overflow-auto rounded bg-muted p-3 text-sm">
                            {JSON.stringify(value, null, 2)}
                        </pre>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
