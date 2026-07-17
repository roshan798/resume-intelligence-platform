import { CreateJobDto } from "../dto/create-job.dto";
import { BackgroundJobRepository } from "../repositories/background-job.repository";

export class CreateJobService {
    private repository = new BackgroundJobRepository();

    execute(dto: CreateJobDto) {
        return this.repository.create(dto);
    }
}
