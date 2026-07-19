import { NotFoundError } from "@/shared/errors/not-found.error";
import { BackgroundJobRepository } from "../repositories/background-job.repository";

export class GetJobService {
    private repository = new BackgroundJobRepository();

    async execute(id: string, userId: string) {
        const job = await this.repository.findByIdAndUser(id, userId);

        if (!job) {
            throw new NotFoundError("Background job not found.");
        }

        return job;
    }
}
