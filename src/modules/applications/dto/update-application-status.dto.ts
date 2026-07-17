import { ApplicationStatus } from "@prisma/client";

export interface UpdateApplicationStatusDto {
    applicationId: string;
    status: ApplicationStatus;
}
