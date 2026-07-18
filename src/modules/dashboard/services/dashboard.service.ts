import { DashboardRepository } from "../repositories/dashboard.repository";

export class DashboardService {
    private repository = new DashboardRepository();

    async execute(userId: string) {
        const [stats, resumes] = await Promise.all([
            this.repository.getStats(userId),
            this.repository.getRecentResumes(userId),
        ]);

        return {
            stats,
            recentResumes: resumes.map((resume) => ({
                id: resume.id,
                title: resume.resume.title,
                versionNumber: resume.versionNumber,
                status: resume.status,
                updatedAt: resume.updatedAt,
            })),
        };
    }
}
