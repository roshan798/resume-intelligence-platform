import { MatchResultRepository } from "@/modules/match/repositories/match-result.repository";
import { auth } from "@/auth";

type Props = {
    params: {
        matchId: string;
    };
};

export default async function MatchPage({ params }: Props) {
    const { matchId } = params;
    const session = await auth();

    if (!session?.user?.id) {
        // Should be handled by layout, but for safety
        return <div>Unauthorized</div>;
    }

    const repository = new MatchResultRepository();

    const result = await repository.getByIdAndUser(matchId, session.user.id);

    if (!result) {
        return <div>Match not found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-6">
            <div>
                <h1 className="text-4xl font-bold">
                    {result.overallScore.toString()}%
                </h1>

                <p className="text-gray-500">
                    {result.resumeVersion.resume.title}
                </p>

                <p className="text-gray-500">{result.jdAnalysis.company}</p>
            </div>
        </div>
    );
}
