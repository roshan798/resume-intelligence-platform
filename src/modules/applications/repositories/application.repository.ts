import { prisma } from "@/lib/prisma";
import { ApplicationStatus, Prisma } from "@prisma/client";

export class ApplicationRepository {
    async create(data: Prisma.ApplicationUncheckedCreateInput) {
        return prisma.$transaction(async (transaction) => {
            const application = await transaction.application.create({ data });
            await transaction.applicationStatusHistory.create({
                data: {
                    applicationId: application.id,
                    status: application.status,
                },
            });
            return application;
        });
    }
    async updateStatus(id: string, status: ApplicationStatus, userId: string) {
        // Use updateMany to avoid throwing an error if the record is not found.
        const result = await prisma.application.updateMany({
            where: {
                id,
                userId,
            },
            data: {
                status,
            },
        });
        return result.count;
    }
    async findByIdAndUser(id: string, userId: string) {
        return prisma.application.findFirst({
            where: {
                id,
                userId,
            },
        });
    }
    async findByUserId(userId: string) {
        return prisma.application.findMany({
            where: {
                userId,
            },
            orderBy: {
                updatedAt: "desc",
            },
            include: {
                resumeVersion: {
                    select: {
                        id: true,
                        versionNumber: true,
                        resume: { select: { id: true, title: true } },
                    },
                },
                jdAnalysis: {
                    select: {
                        id: true,
                        jobDescriptionId: true,
                    },
                },
            },
        });
    }

    async update(
        id: string,
        userId: string,
        data: Prisma.ApplicationUncheckedUpdateInput,
    ) {
        const result = await prisma.application.updateMany({
            where: { id, userId },
            data,
        });
        if (result.count === 0) return null;
        return this.findByIdAndUser(id, userId);
    }

    async delete(id: string, userId: string) {
        const result = await prisma.application.deleteMany({
            where: { id, userId },
        });
        return result.count > 0;
    }
}
