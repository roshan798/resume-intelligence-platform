import { ApplicationStatus } from "@prisma/client";

export interface ApplicationResponseDto {
    id: string;
    company: string;
    roleTitle: string;
    status: ApplicationStatus;
    appliedDate: Date | null;
    createdAt: Date;
}
