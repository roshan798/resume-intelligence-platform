import { GetMatchResultService } from "@/modules/jd/services/get-match-result.service";

type Props = {
    params: Promise<{
        matchId: string;
    }>;
};

export default async function MatchPage({ params }: Props) {
    const { matchId } = await params;

    const service = new GetMatchResultService();

    const result = await service.execute(matchId);

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
