import { Job } from "bullmq";
import { UpdateJobService } from "@/modules/background-jobs/services/update-job.service";

export abstract class BaseProcessor<T> {
    protected readonly jobs = new UpdateJobService();

    protected async start(job: Job<T>) {
        const { backgroundJobId } = job.data as {
            backgroundJobId: string;
        };

        await this.jobs.execute(backgroundJobId, {
            status: "ACTIVE",
            startedAt: new Date(),
            progress: 0,
            queueJobId: job.id,
        });
    }

    protected async progress(job: Job<T>, progress: number) {
        const { backgroundJobId } = job.data as {
            backgroundJobId: string;
        };

        await job.updateProgress(progress);

        await this.jobs.progress(backgroundJobId, progress);
    }

    protected async complete(job: Job<T>, result?: object) {
        const { backgroundJobId } = job.data as {
            backgroundJobId: string;
        };

        await this.jobs.complete(backgroundJobId, result);
    }

    protected async fail(job: Job<T>, error: unknown) {
        const { backgroundJobId } = job.data as {
            backgroundJobId: string;
        };

        await this.jobs.fail(
            backgroundJobId,
            error instanceof Error ? error.message : String(error),
        );
    }
}
