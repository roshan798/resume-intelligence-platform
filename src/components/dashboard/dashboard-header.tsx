import { Button } from "@/components/ui/button";

export function DashboardHeader() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">
                    Resume Intelligence Platform
                </h1>

                <p className="text-muted-foreground">Welcome back.</p>
            </div>

            <Button>Upload Resume</Button>
        </div>
    );
}
