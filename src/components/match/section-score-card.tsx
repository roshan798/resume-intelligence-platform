interface SectionScoreCardProps {
    sectionScores: Record<string, number>;
}

export function SectionScoreCard({ sectionScores }: SectionScoreCardProps) {
    return (
        <div className="rounded-lg border p-6">
            <h3 className="mb-6 text-xl font-semibold">Section Scores</h3>

            <div className="space-y-4">
                {Object.entries(sectionScores).map(([section, score]) => (
                    <div key={section}>
                        <div className="mb-2 flex justify-between">
                            <span className="capitalize">{section}</span>

                            <span>{score}%</span>
                        </div>

                        <div className="h-3 rounded bg-gray-200">
                            <div
                                className="h-3 rounded bg-green-500 transition-all"
                                style={{
                                    width: `${score}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
