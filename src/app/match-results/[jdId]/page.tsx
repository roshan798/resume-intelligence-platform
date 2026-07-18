import { MatchResultRepository } from "@/modules/match/repositories/match-result.repository";
import { auth } from "@/auth";

interface PageProps {
    params: {
        jdId: string;
    };
}

export default async function Page({ params }: PageProps) {
    const { jdId } = params;
    const session = await auth();
    if (!session?.user?.id) {
        return <div>Unauthorized</div>;
    }

    const repository = new MatchResultRepository();
    const results = await repository.getByAnalysisAndUser(jdId, session.user.id);

    return (
        <div className="space-y-4">
            {results.map((result) => (
                <div
                    key={result.id}
                    className="border rounded p-4">
                    <div>{result.resumeVersion.resume.title}</div>
                    <div>{result.overallScore.toString()}%</div>
                </div>
            ))}
        </div>
    );
}
