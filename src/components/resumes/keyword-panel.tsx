import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    keywords: Record<string, unknown> | null;
}

export function KeywordPanel({ keywords }: Props) {
    if (!keywords) {
        return null;
    }

    const list = Object.keys(keywords);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Canonical Keywords</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-wrap gap-2">
                {list.map((keyword) => (
                    <Badge key={keyword}>{keyword}</Badge>
                ))}
            </CardContent>
        </Card>
    );
}
