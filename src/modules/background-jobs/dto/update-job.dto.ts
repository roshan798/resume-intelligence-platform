import { BackgroundJobStatus } from "@prisma/client";

export interface UpdateJobDto {
    status?: BackgroundJobStatus;
    progress?: number;
    queueJobId?: string;
    result?: object;
    error?: string;
    startedAt?: Date;
    completedAt?: Date;
}
