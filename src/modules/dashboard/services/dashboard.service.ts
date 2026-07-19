import { DashboardRepository } from "../repositories/dashboard.repository";

export class DashboardService {
    private repository = new DashboardRepository();

    async execute(userId: string) {
        const [
            stats,
            resumes,
            applications,
            history,
        ] = await Promise.all([
            this.repository.getStats(userId),
            this.repository.getRecentResumes(userId),
            this.repository.getRecentApplications(userId),
            this.repository.getRecentActivity(userId),
        ]);

        const recentResumes = resumes.map((v) => ({
            ...v,
            title: v.resume.title,
        }));

        return {
            stats,
            recentResumes,
            recentApplications: applications,
            activities: history.map((item) => ({
                id: item.id,
                title: `${item.application.company} · ${item.application.roleTitle}`,
                description: `Moved to ${item.status.toLocaleLowerCase().replaceAll("_", " ")}`,
                createdAt: item.changedAt,
            })),
        };
    }
}
