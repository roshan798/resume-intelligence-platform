interface KeywordListProps {
    title: string;
    keywords: string[];
    variant: "matched" | "missing" | "weak";
}

const styles = {
    matched: "bg-green-100 text-green-700",
    missing: "bg-red-100 text-red-700",
    weak: "bg-yellow-100 text-yellow-700",
};

export function KeywordList({ title, keywords, variant }: KeywordListProps) {
    return (
        <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">
                {title} ({keywords.length})
            </h3>

            <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                    <span
                        key={keyword}
                        className={`rounded-full px-3 py-1 text-sm font-medium ${styles[variant]}`}>
                        {keyword}
                    </span>
                ))}
            </div>
        </div>
    );
}
