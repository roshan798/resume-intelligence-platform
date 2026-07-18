import { ResumeRepository } from "../repositories/resume.repository";
export class GetResumeService {
    private repository = new ResumeRepository();
    async execute(userId: string, resumeId: string) {
        const resume = await this.repository.findById(userId, resumeId);
        if (!resume) {
            return null;
        }
        return {
            id: resume.id,
            title: resume.title,
            primaryStack: resume.primaryStack,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
            versions: resume.versions.map((version) => ({
                id: version.id,
                versionNumber: version.versionNumber,
                status: version.status,
                createdAt: version.createdAt,
                updatedAt: version.updatedAt,
                sourceFormat: version.sourceFormat,
                matchCount: version.matchResults.length,
                rawText: version.rawText,
                parsedSections: version.parsedSections,
                canonicalKeywords: version.canonicalKeywords,
                latexSource: version.latexSource,
            })),
        };
    }
}
