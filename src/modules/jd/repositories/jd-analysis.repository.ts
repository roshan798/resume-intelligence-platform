import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "@/generated/prisma";

export class JDAnalysisRepository {
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
