import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
    return (
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-3xl font-bold">{title}</CardTitle>

                <p className="text-muted-foreground">{description}</p>
            </CardHeader>

            <CardContent>{children}</CardContent>
        </Card>
    );
}
