import { DashboardRepository } from "../repositories/dashboard.repository";

export class DashboardService {
    private repository = new DashboardRepository();

    async execute(userId: string) {
        const [stats, resumes, applications, activity] = await Promise.all([
            this.repository.getStats(userId),
            this.repository.getRecentResumes(userId),
            this.repository.getRecentApplications(userId),
            this.repository.getRecentActivities(userId),
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

            recentApplications: applications,

            activity,
        };
    }
}
