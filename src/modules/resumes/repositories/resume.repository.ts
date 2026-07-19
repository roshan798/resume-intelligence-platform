import { prisma } from "@/lib/prisma";
import { Prisma, SourceFormat } from "@/generated/prisma";

export class ResumeRepository {
    async findAllByUser(userId: string) {
        return prisma.resume.findMany({
            where: {
                userId,
            },

            include: {
                tags: {
                    where: {
                        scope: "RESUME",
                        resumeVersionId: null,
                    },
                    orderBy: {
                        tag: "asc",
                    },
                },
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

    async updateMetadataAndTags(
        userId: string,
        resumeId: string,
        data: {
            title: string;
            primaryStack: string | null;
            tags: string[];
        },
    ) {
        return prisma.$transaction(async (transaction) => {
            const updateResult = await transaction.resume.updateMany({
                where: {
                    id: resumeId,
                    userId,
                },
                data: {
                    title: data.title,
                    primaryStack: data.primaryStack,
                },
            });

            if (updateResult.count === 0) return null;

            await transaction.resumeTag.deleteMany({
                where: {
                    resumeId,
                    scope: "RESUME",
                    resumeVersionId: null,
                },
            });

            if (data.tags.length > 0) {
                await transaction.resumeTag.createMany({
                    data: data.tags.map((tag) => ({
                        resumeId,
                        tag,
                        scope: "RESUME",
                    })),
                });
            }

            return transaction.resume.findUnique({
                where: {
                    id: resumeId,
                },
                include: {
                    tags: {
                        where: {
                            scope: "RESUME",
                            resumeVersionId: null,
                        },
                        orderBy: {
                            tag: "asc",
                        },
                    },
                },
            });
        });
    }

    async findById(userId: string, resumeId: string) {
        return prisma.resume.findFirst({
            where: {
                id: resumeId,
                userId,
            },

            include: {
                tags: {
                    where: {
                        scope: "RESUME",
                        resumeVersionId: null,
                    },
                    orderBy: {
                        tag: "asc",
                    },
                },
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
