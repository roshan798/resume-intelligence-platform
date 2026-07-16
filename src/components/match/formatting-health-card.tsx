interface FormattingHealthCardProps {
    score: number;
    warnings: string[];
}

export function FormattingHealthCard({
    score,
    warnings,
}: FormattingHealthCardProps) {
    return (
        <div className="rounded-lg border p-6">
            <h3 className="mb-4 text-xl font-semibold">
                ATS Formatting Health
            </h3>

            <div className="mb-6">
                <p className="text-sm text-gray-500">ATS Health Score</p>

                <h2 className="text-4xl font-bold text-blue-600">{score}%</h2>
            </div>

            <div>
                <h4 className="mb-2 font-medium">Warnings</h4>

                {warnings.length === 0 && (
                    <p className="text-green-600">
                        No formatting issues detected.
                    </p>
                )}

                <ul className="space-y-2">
                    {warnings.map((warning) => (
                        <li
                            key={warning}
                            className="rounded bg-yellow-50 p-2 text-sm text-yellow-700">
                            {warning}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
