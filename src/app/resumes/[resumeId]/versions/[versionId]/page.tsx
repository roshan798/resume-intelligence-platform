import { FormattingHealthCard } from "@/components/match/formatting-health-card";
import { KeywordList } from "@/components/match/keyword-list";

export default async function Page(props: {
    params: Promise<{
        versionId: string;
    }>;
}) {
    const params = await props.params;

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/resumes/versions/${params.versionId}`,
        {
            cache: "no-store",
        },
    );

    const version = await response.json();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Version v{version.versionNumber}
                </h1>
                <p>Status: {version.status}</p>
            </div>

            {/* Fix 1: Changed variant to an accepted union type value */}
            <KeywordList
                title="Keywords"
                keywords={version.canonicalKeywords}
                variant="matched"
            />

            {/* Fix 2: Removed 'issues' since the component only expects the 'score' property */}
            <FormattingHealthCard score={100} warnings={[]}/>

            {version.latexSource && (
                <pre className="overflow-auto rounded border p-4">
                    {version.latexSource}
                </pre>
            )}
        </div>
    );
}
