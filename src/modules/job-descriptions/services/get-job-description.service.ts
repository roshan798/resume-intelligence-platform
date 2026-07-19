import { JobDescriptionRepository } from "../repositories/job-description.repository";

export class GetJobDescriptionService {
    private readonly repository = new JobDescriptionRepository();

    execute(id: string, userId: string) {
        return this.repository.findByIdAndUser(id, userId);
    }
}
