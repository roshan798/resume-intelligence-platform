import { ApplicationStatus } from "@prisma/client";

export interface KanbanCardDto {
    id: string;
    company: string;
    roleTitle: string;
    status: ApplicationStatus;
    appliedDate: Date | null;
}

export interface KanbanBoardDto {
    saved: KanbanCardDto[];
    applied: KanbanCardDto[];
    oa: KanbanCardDto[];
    interview: KanbanCardDto[];
    rejected: KanbanCardDto[];
    offer: KanbanCardDto[];
    closed: KanbanCardDto[];
}
