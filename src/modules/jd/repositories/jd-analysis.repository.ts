import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export class JDAnalysisRepository {
    async findByIdAndUser(id: string, userId: string) {
        return prisma.jDAnalysis.findFirst({
            where: { id, userId },
            select: { id: true, parsedKeywords: true },
        });
    }

    async create(data: {
        userId: string;
        rawText: string;
        company?: string;
        roleTitle?: string;
        parsedKeywords: Prisma.InputJsonValue;
    }) {
        return prisma.jDAnalysis.create({
            data,
        });
    }
}
