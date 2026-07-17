import { ApplicationStatus } from "@prisma/client";

import { ApplicationRepository } from "../repositories/application.repository";
import { ApplicationStatusHistoryRepository } from "../repositories/application-status-history.repository";

export class MoveApplicationService {
    private readonly repository = new ApplicationRepository();

    private readonly historyRepository =
        new ApplicationStatusHistoryRepository();

    async execute(applicationId: string, targetStatus: ApplicationStatus) {
        const application = await this.repository.updateStatus(
            applicationId,
            targetStatus,
        );

        await this.historyRepository.create(applicationId, targetStatus);

        return application;
    }
}
