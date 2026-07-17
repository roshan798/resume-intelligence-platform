import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma/prisma";

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

    async getLineage(resumeId: string) {
        return prisma.resumeVersion.findMany({
            where: {
                resumeId,
            },

            orderBy: {
                versionNumber: "asc",
            },
        });
    }

    async updateDraft(id: string, data: Prisma.ResumeVersionUncheckedUpdateInput) {
        return prisma.resumeVersion.update({
            where: {
                id,
            },
            data,
        });
    }
}