import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
export class ResumeVersionRepository {
    async getActiveVersions(userId: string) {
        return prisma.resumeVersion.findMany({
            where: {
                resume: {
                    userId,
                },
                status: {
                    not: "ARCHIVED",
                },
            },
            include: {
                resume: true,
            },
        });
    }

    async findById(id: string) {
        return prisma.resumeVersion.findUnique({
            where: {
                id,
            },
        });
    }

    async findByIdAndUser(id: string, userId: string) {
        return prisma.resumeVersion.findFirst({
            where: {
                id,
                resume: {
                    userId,
                },
            },
        });
    }

    async findDetailedVersion(id: string, userId: string) {
        return prisma.resumeVersion.findFirst({
            where: {
                id,
                resume: {
                    userId,
                },
            },

            include: {
                resume: true,

                parent: {
                    select: {
                        id: true,
                        versionNumber: true,
                        status: true,
                    },
                },

                children: {
                    orderBy: {
                        versionNumber: "asc",
                    },

                    select: {
                        id: true,
                        versionNumber: true,
                        status: true,
                    },
                },

                fileAsset: true,

                matchResults: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
    }

    async getLatestVersionNumber(resumeId: string) {
        const latest = await prisma.resumeVersion.findFirst({
            where: {
                resumeId,
            },
            orderBy: {
                versionNumber: "desc",
            },
        });

        return latest?.versionNumber ?? 0;
    }

    async createVersion(data: Prisma.ResumeVersionUncheckedCreateInput) {
        return prisma.resumeVersion.create({
            data,
        });
    }

    async getLineage(resumeId: string, userId: string) {
        return prisma.resumeVersion.findMany({
            where: {
                resumeId,
                resume: {
                    userId,
                },
            },

            orderBy: {
                versionNumber: "asc",
            },

            select: {
                id: true,
                versionNumber: true,
                status: true,
                parentVersionId: true,
                createdAt: true,
            },
        });
    }

    async updateDraft(
        id: string,
        data: Prisma.ResumeVersionUncheckedUpdateInput,
    ) {
        return prisma.resumeVersion.update({
            where: {
                id,
            },
            data,
        });
    }

    async archive(id: string) {
        return prisma.resumeVersion.update({
            where: {
                id,
            },

            data: {
                status: "ARCHIVED",
            },
        });
    }

    async finalize(id: string) {
        return prisma.resumeVersion.update({
            where: {
                id,
            },

            data: {
                status: "FINAL",
            },
        });
    }
}
