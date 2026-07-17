import { ApplicationStatus } from "@prisma/client";

import { ApplicationRepository } from "../repositories/application.repository";

export class GetKanbanBoardService {
    private readonly repository = new ApplicationRepository();

    async execute(userId: string) {
        const applications = await this.repository.findByUserId(userId);

        return {
            saved: applications.filter(
                (a) => a.status === ApplicationStatus.SAVED,
            ),

            applied: applications.filter(
                (a) => a.status === ApplicationStatus.APPLIED,
            ),

            oa: applications.filter((a) => a.status === ApplicationStatus.OA),

            interview: applications.filter(
                (a) => a.status === ApplicationStatus.INTERVIEW,
            ),

            rejected: applications.filter(
                (a) => a.status === ApplicationStatus.REJECTED,
            ),

            offer: applications.filter(
                (a) => a.status === ApplicationStatus.OFFER,
            ),
            
            closed: applications.filter(
                (a) => a.status === ApplicationStatus.CLOSED,
            ),
        };
    }
}
