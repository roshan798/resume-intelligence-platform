import { UpdateJobDto } from "../dto/update-job.dto";
import { BackgroundJobRepository } from "../repositories/background-job.repository";

export class UpdateJobService {
    private repository = new BackgroundJobRepository();

    execute(id: string, dto: UpdateJobDto) {
        return this.repository.update(id, dto);
    }

    progress(id: string, progress: number) {
        return this.repository.updateProgress(id, progress);
    }

    complete(id: string, result?: object) {
        return this.repository.complete(id, result);
    }

    fail(id: string, error: Error | string) {
        return this.repository.fail(
            id,
            error instanceof Error ? error.message : error,
        );
    }
}
