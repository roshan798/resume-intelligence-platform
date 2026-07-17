import { prisma } from "@/lib/prisma";

export class GetMatchResultService {
    async execute(matchId: string) {
        return prisma.matchResult.findUnique({
            where: {
                id: matchId,
            },
            include: {
                jdAnalysis: true,
                resumeVersion: {
                    include: {
                        resume: true,
                    },
                },
            },
        });
    }
}
