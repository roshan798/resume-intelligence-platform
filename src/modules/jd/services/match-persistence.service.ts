import { prisma } from "@/lib/prisma/prisma";

export class MatchPersistenceService {
    async persist(
        jdAnalysisId: string,
        results: {
            resumeVersionId: string;
            overallScore: number;
            matchedKeywords: string[];
            missingKeywords: string[];
            weakKeywords: string[];
        }[],
    ) {
        await prisma.matchResult.createMany({
            data: results.map((result) => ({
                jdAnalysisId,

                resumeVersionId: result.resumeVersionId,

                overallScore: result.overallScore,

                matchedKeywords: result.matchedKeywords,

                missingKeywords: result.missingKeywords,

                weakKeywords: result.weakKeywords,

                sectionScores: {},

                formattingHealth: {},
            })),
        });
    }
}
