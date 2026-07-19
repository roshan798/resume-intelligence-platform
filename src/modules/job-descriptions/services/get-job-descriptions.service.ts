import { JobDescriptionRepository } from "../repositories/job-description.repository";

export class GetJobDescriptionsService {
    private readonly repository = new JobDescriptionRepository();

    execute(userId: string) {
        return this.repository.findAllByUser(userId);
    }
}
