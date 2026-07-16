// Type interface for the Next.js Page Props component
interface PageProps {
    params: Promise<{
        jdId: string;
    }>;
}

// Type interface matching your MatchResult repository return shape
interface MatchResultItem {
    id: string;
    overallScore: number;
    resumeVersion: {
        resume: {
            title: string;
        };
    };
}

async function getResults(jdId: string): Promise<MatchResultItem[]> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/match/${jdId}`,
        {
            cache: "no-store",
        },
    );

    return response.json();
}

export default async function Page({ params }: PageProps) {
    // Fix 1: Await the params object (required in modern Next.js versions)
    const { jdId } = await params;
    const results = await getResults(jdId);

    return (
        <div className="space-y-4">
            {/* Fix 2: TypeScript now infers 'result' accurately from the function return type */}
            {results.map((result) => (
                <div
                    key={result.id}
                    className="border rounded p-4">
                    <div>{result.resumeVersion.resume.title}</div>
                    <div>{result.overallScore}%</div>
                </div>
            ))}
        </div>
    );
}
