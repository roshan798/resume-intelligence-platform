import { ApplicationStatusHistoryRepository } from "../repositories/application-status-history.repository";

export class GetApplicationHistoryService {
    private readonly repository = new ApplicationStatusHistoryRepository();

    async execute(applicationId: string) {
        return this.repository.findByApplicationId(applicationId);
    }
}
