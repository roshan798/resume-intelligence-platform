import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    activity: {
        id: string;
        title: string;
        createdAt: Date;
    }[];
}

export function ActivityFeed({ activity }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {activity.map((item) => (
                    <div key={item.id}>
                        <p>{item.title}</p>

                        <p className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
