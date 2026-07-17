import { BackgroundJobStatus, BackgroundJobType } from "@prisma/client";

export interface JobStatusDto {
    id: string;
    type: BackgroundJobType;
    status: BackgroundJobStatus;
    progress: number;
    createdAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
}
