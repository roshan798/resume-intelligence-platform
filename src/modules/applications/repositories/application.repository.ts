import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "@/generated/prisma";
import { ApplicationStatus } from "@prisma/client";

export class ApplicationRepository {
    async create(data: Prisma.ApplicationUncheckedCreateInput) {
        return prisma.application.create({
            data,
        });
    }
    async updateStatus(id: string, status: ApplicationStatus) {
        return prisma.application.update({
            where: {
                id,
            },
            data: {
                status,
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
