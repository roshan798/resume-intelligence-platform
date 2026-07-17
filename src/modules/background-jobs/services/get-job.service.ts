import { NotFoundError } from "@/shared/errors/not-found.error";
import { BackgroundJobRepository } from "../repositories/background-job.repository";

export class GetJobService {
    private repository = new BackgroundJobRepository();

    async execute(id: string) {
        const job = await this.repository.findById(id);

        if (!job) {
            throw new NotFoundError("Background job not found.");
        }

        return job;
    }
}
