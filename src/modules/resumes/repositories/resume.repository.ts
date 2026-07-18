import { prisma } from "@/lib/prisma";
import { Prisma, SourceFormat } from "@/generated/prisma";

export class ResumeRepository {
    async findAllByUser(userId: string) {
        return prisma.resume.findMany({
            where: {
                userId,
            },

            include: {
                versions: {
                    include: {
                        matchResults: true,
                    },

                    orderBy: {
                        versionNumber: "desc",
                    },
                },
            },

            orderBy: {
                updatedAt: "desc",
            },
        });
    }

    async findById(userId: string, resumeId: string) {
        return prisma.resume.findFirst({
            where: {
                id: resumeId,
                userId,
            },

            include: {
                versions: {
                    include: {
                        matchResults: true,
                    },

                    orderBy: {
                        versionNumber: "desc",
                    },
                },
            },
        });
    }

    async createResume(userId: string, title: string, primaryStack?: string) {
        return prisma.resume.create({
            data: {
                userId,
                title,
                primaryStack,
            },
        });
    }

    async createVersion(data: {
        resumeId: string;
        fileAssetId: string;
        sourceFormat: SourceFormat;
    }) {
        return prisma.resumeVersion.create({
            data: {
                resumeId: data.resumeId,
                versionNumber: 1,
                status: "MASTER",
                sourceFormat: data.sourceFormat,

                rawText: "",

                parsedSections: {},

                canonicalKeywords: [],

                fingerprintHash: "",

                fileAssetId: data.fileAssetId,
            },
        });
    }

    async updateParsedData(
        versionId: string,
        parsed: {
            rawText: string;
            parsedSections: Prisma.InputJsonValue;
            canonicalKeywords: Prisma.InputJsonValue;
        },
    ) {
        return prisma.resumeVersion.update({
            where: {
                id: versionId,
            },

            data: {
                rawText: parsed.rawText,
                parsedSections: parsed.parsedSections,
                canonicalKeywords: parsed.canonicalKeywords,
            },
        });
    }
}
