import { ResumeVersionRepository } from "../repositories/resume-version.repository";

export class GetVersionLineageService {
    private repository = new ResumeVersionRepository();

    async execute(resumeId: string, userId: string) {
        return this.repository.getLineage(resumeId, userId);
    }
}
