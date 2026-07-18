import { prisma } from "@/lib/prisma";
import { ApplicationStatusHistoryRepository } from "../repositories/application-status-history.repository";

export class GetApplicationHistoryService {
    private readonly repository = new ApplicationStatusHistoryRepository();

    async execute(applicationId: string, userId: string) {
        const application = await prisma.application.findFirst({
            where: {
                id: applicationId,
                userId,
            },
        });

        if (!application) {
            return null;
        }

        return this.repository.findByApplicationId(applicationId);
    }
}
