import { BackgroundJobStatus, BackgroundJobType } from "@prisma/client";

export interface CreateJobDto {
    userId: string;
    type: BackgroundJobType;
    payload: object;
    status?: BackgroundJobStatus;
}
