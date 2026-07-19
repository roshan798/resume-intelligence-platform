import { JobDescriptionRepository } from "../repositories/job-description.repository";

export class SetJobDescriptionStatusService {
    private readonly repository = new JobDescriptionRepository();

    execute(
        id: string,
        userId: string,
        status: "ACTIVE" | "ARCHIVED",
    ) {
        return this.repository.updateStatus(id, userId, status);
    }
}
