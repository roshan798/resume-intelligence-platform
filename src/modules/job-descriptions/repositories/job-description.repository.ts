import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface JobDescriptionMetadata {
    company: string | null;
    roleTitle: string;
    location: string | null;
    sourceUrl: string | null;
    experienceRequirements: string | null;
}

export class JobDescriptionRepository {
    async findAllByUser(userId: string) {
        return prisma.jobDescription.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            include: {
                snapshots: {
                    orderBy: { snapshotNumber: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        snapshotNumber: true,
                        createdAt: true,
                    },
                },
                _count: { select: { snapshots: true } },
            },
        });
    }

    async findByIdAndUser(id: string, userId: string) {
        return prisma.jobDescription.findFirst({
            where: { id, userId },
            include: {
                snapshots: {
                    orderBy: { snapshotNumber: "desc" },
                    select: {
                        id: true,
                        snapshotNumber: true,
                        rawText: true,
                        parsedKeywords: true,
                        createdAt: true,
                        _count: {
                            select: {
                                matchResults: true,
                                resumeVersions: true,
                                applications: true,
                                aiSuggestions: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async createWithSnapshot(
        userId: string,
        metadata: JobDescriptionMetadata,
        snapshot: {
            rawText: string;
            parsedKeywords: Prisma.InputJsonValue;
        },
    ) {
        return prisma.$transaction(async (transaction) => {
            const jobDescription = await transaction.jobDescription.create({
                data: { userId, ...metadata },
            });
            const createdSnapshot = await transaction.jDAnalysis.create({
                data: {
                    userId,
                    jobDescriptionId: jobDescription.id,
                    snapshotNumber: 1,
                    rawText: snapshot.rawText,
                    company: metadata.company,
                    roleTitle: metadata.roleTitle,
                    parsedKeywords: snapshot.parsedKeywords,
                },
            });

            return { jobDescription, snapshot: createdSnapshot };
        });
    }

    async createSnapshot(
        id: string,
        userId: string,
        snapshot: {
            rawText: string;
            parsedKeywords: Prisma.InputJsonValue;
        },
    ) {
        return prisma.$transaction(async (transaction) => {
            const jobDescription = await transaction.jobDescription.findFirst({
                where: { id, userId },
                select: {
                    id: true,
                    company: true,
                    roleTitle: true,
                },
            });

            if (!jobDescription) return null;

            const latest = await transaction.jDAnalysis.aggregate({
                where: { jobDescriptionId: id },
                _max: { snapshotNumber: true },
            });

            return transaction.jDAnalysis.create({
                data: {
                    userId,
                    jobDescriptionId: id,
                    snapshotNumber: (latest._max.snapshotNumber ?? 0) + 1,
                    rawText: snapshot.rawText,
                    company: jobDescription.company,
                    roleTitle: jobDescription.roleTitle,
                    parsedKeywords: snapshot.parsedKeywords,
                },
            });
        });
    }

    async updateMetadata(
        id: string,
        userId: string,
        metadata: JobDescriptionMetadata,
    ) {
        const result = await prisma.jobDescription.updateMany({
            where: { id, userId },
            data: metadata,
        });

        if (result.count === 0) return null;
        return prisma.jobDescription.findUnique({ where: { id } });
    }

    async updateStatus(
        id: string,
        userId: string,
        status: "ACTIVE" | "ARCHIVED",
    ) {
        const result = await prisma.jobDescription.updateMany({
            where: { id, userId },
            data: { status },
        });

        return result.count > 0;
    }

    async findDeletionState(id: string, userId: string) {
        return prisma.jobDescription.findFirst({
            where: { id, userId },
            select: {
                id: true,
                snapshots: {
                    select: {
                        _count: {
                            select: {
                                matchResults: true,
                                resumeVersions: true,
                                applications: true,
                                aiSuggestions: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async deleteWithSnapshots(id: string) {
        return prisma.$transaction(async (transaction) => {
            await transaction.jDAnalysis.deleteMany({
                where: { jobDescriptionId: id },
            });
            return transaction.jobDescription.delete({ where: { id } });
        });
    }
}
