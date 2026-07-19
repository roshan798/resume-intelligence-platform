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

    async findTailoredDraft(
        parentVersionId: string,
        jdSnapshotId: string,
        userId: string,
    ) {
        return prisma.resumeVersion.findFirst({
            where: {
                parentVersionId,
                jdSnapshotId,
                status: "TAILORED_DRAFT",
                resume: { userId },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async findDetailedVersion(versionId: string, userId: string) {
        return prisma.resumeVersion.findFirst({
            where: {
                id: versionId,
                resume: {
                    userId,
                },
            },
            include: {
                resume: {
                    select: {
                        id: true,
                        title: true,
                        primaryStack: true,
                    },
                },
                parent: {
                    select: {
                        id: true,
                        versionNumber: true,
                        status: true,
                    },
                },
                fileAsset: {
                    select: {
                        id: true,
                        mimeType: true,
                    },
                },
                _count: {
                    select: {
                        matchResults: true,
                    },
                },
            },
        });
    }

    async findPreviewSource(versionId: string, userId: string) {
        return prisma.resumeVersion.findFirst({
            where: {
                id: versionId,
                resume: {
                    userId,
                },
            },
            select: {
                sourceFormat: true,
                fileAsset: {
                    select: {
                        storageRef: true,
                        mimeType: true,
                        userId: true,
                    },
                },
            },
        });
    }

    async findSimilarityTarget(versionId: string, userId: string) {
        return prisma.resumeVersion.findFirst({
            where: {
                id: versionId,
                resume: {
                    userId,
                },
            },
            select: {
                id: true,
                resumeId: true,
                parentVersionId: true,
                versionNumber: true,
                rawText: true,
                resume: {
                    select: {
                        title: true,
                    },
                },
            },
        });
    }

    async findSimilarityCandidates(versionId: string, userId: string) {
        return prisma.resumeVersion.findMany({
            where: {
                id: {
                    not: versionId,
                },
                rawText: {
                    not: "",
                },
                resume: {
                    userId,
                },
            },
            select: {
                id: true,
                resumeId: true,
                parentVersionId: true,
                versionNumber: true,
                rawText: true,
                resume: {
                    select: {
                        title: true,
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
    async findForDeletion(versionId: string, userId: string) {
        return prisma.resumeVersion.findFirst({
            where: {
                id: versionId,
                resume: {
                    userId,
                },
            },
            include: {
                _count: {
                    select: {
                        children: true,
                        matchResults: true,
                        applications: true,
                    },
                },
            },
        });
    }

    async countByResumeId(resumeId: string): Promise<number> {
        return prisma.resumeVersion.count({
            where: {
                resumeId,
            },
        });
    }

    async deleteById(versionId: string) {
        return prisma.resumeVersion.delete({
            where: {
                id: versionId,
            },
        });
    }
}
