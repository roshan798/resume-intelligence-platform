import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

export class ApplicationStatusHistoryRepository {
    async create(applicationId: string, status: ApplicationStatus) {
        return prisma.applicationStatusHistory.create({
            data: {
                applicationId,
                status,
            },
        });
    }

    async findByApplicationId(applicationId: string) {
        return prisma.applicationStatusHistory.findMany({
            where: {
                applicationId,
            },
            orderBy: {
                changedAt: "desc",
            },
        });
    }
}
