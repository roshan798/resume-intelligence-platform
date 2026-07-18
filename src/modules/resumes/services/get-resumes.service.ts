import { ResumeRepository } from "../repositories/resume.repository";
export class GetResumesService {
    private repository = new ResumeRepository();
    async execute(userId: string) {
        const resumes = await this.repository.findAllByUser(userId);
        return resumes.map((resume) => {
            const latestVersion = resume.versions[0];
            return {
                id: resume.id,
                title: resume.title,
                primaryStack: resume.primaryStack,
                createdAt: resume.createdAt,
                updatedAt: resume.updatedAt,
                versionCount: resume.versions.length,
                latestVersion:
                    latestVersion == null
                        ? null
                        : {
                              id: latestVersion.id,
                              versionNumber: latestVersion.versionNumber,
                              status: latestVersion.status,
                              createdAt: latestVersion.createdAt,
                              matchCount: latestVersion.matchResults.length,
                          },
            };
        });
    }
}
