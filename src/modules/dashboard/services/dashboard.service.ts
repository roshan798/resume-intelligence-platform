import { DashboardRepository } from "../repositories/dashboard.repository";

export class DashboardService {
    private repository = new DashboardRepository();

    async execute(userId: string) {
        const [
            stats,
            resumes,
            applications,
        ] = await Promise.all([
            this.repository.getStats(userId),
            this.repository.getRecentResumes(userId),
            this.repository.getRecentApplications(userId),
        ]);

        const recentResumes = resumes.map((v) => ({
            ...v,
            title: v.resume.title,
        }));

        return {
            stats,
            recentResumes,
            recentApplications: applications,
            activities: [],
        };
    }
}
