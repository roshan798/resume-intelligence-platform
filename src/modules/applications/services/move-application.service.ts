import { ApplicationStatus } from "@prisma/client";

import { ApplicationRepository } from "../repositories/application.repository";
import { ApplicationStatusHistoryRepository } from "../repositories/application-status-history.repository";

export class MoveApplicationService {
    private readonly repository = new ApplicationRepository();

    private readonly historyRepository =
        new ApplicationStatusHistoryRepository();

    async execute(
        applicationId: string,
        targetStatus: ApplicationStatus,
        userId: string,
    ) {
        const updatedCount = await this.repository.updateStatus(
            applicationId,
            targetStatus,
            userId,
        );

        if (updatedCount === 0) {
            return null;
        }

        await this.historyRepository.create(applicationId, targetStatus);

        return this.repository.findByIdAndUser(applicationId, userId);
    }
}
