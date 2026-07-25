import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <main className="app-page" aria-label="Loading page">
            <div className="space-y-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-10 w-full max-w-md" />
                <Skeleton className="h-5 w-full max-w-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-xl" />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-72 rounded-xl" />
                <Skeleton className="h-72 rounded-xl" />
            </div>
        </main>
    );
}
