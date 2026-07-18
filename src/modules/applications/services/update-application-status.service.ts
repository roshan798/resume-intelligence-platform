import { ApplicationStatus } from "@prisma/client";

import { ApplicationRepository } from "../repositories/application.repository";
import { ApplicationStatusHistoryRepository } from "../repositories/application-status-history.repository";

export class UpdateApplicationStatusService {
    private readonly applicationRepository = new ApplicationRepository();

    private readonly historyRepository =
        new ApplicationStatusHistoryRepository();

    async execute(
        applicationId: string,
        status: ApplicationStatus,
        userId: string,
    ) {
        const updatedCount = await this.applicationRepository.updateStatus(
            applicationId,
            status,
            userId,
        );

        if (updatedCount === 0) {
            return null;
        }

        await this.historyRepository.create(applicationId, status);

        return this.applicationRepository.findByIdAndUser(applicationId, userId);
    }
}
