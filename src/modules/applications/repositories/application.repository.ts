import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "@/generated/prisma";
import { ApplicationStatus } from "@prisma/client";

export class ApplicationRepository {
    async create(data: Prisma.ApplicationUncheckedCreateInput) {
        return prisma.application.create({
            data,
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
                createdAt: "desc",
            },
        });
    }
}
