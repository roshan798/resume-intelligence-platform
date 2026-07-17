import { ApplicationStatus } from "@prisma/client";

import { ApplicationRepository } from "../repositories/application.repository";
import { ApplicationStatusHistoryRepository } from "../repositories/application-status-history.repository";

export class UpdateApplicationStatusService {
    private readonly applicationRepository = new ApplicationRepository();

    private readonly historyRepository =
        new ApplicationStatusHistoryRepository();

    async execute(applicationId: string, status: ApplicationStatus) {
        const application = await this.applicationRepository.updateStatus(
            applicationId,
            status,
        );

        await this.historyRepository.create(applicationId, status);

        return application;
    }
}
