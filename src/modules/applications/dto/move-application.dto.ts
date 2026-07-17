import { ApplicationStatus } from "@prisma/client";

export interface MoveApplicationDto {
    applicationId: string;
    targetStatus: ApplicationStatus;
}
