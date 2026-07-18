import { ResumeVersionRepository } from "../repositories/resume-version.repository";

export class GetVersionService {
    private repository = new ResumeVersionRepository();

    async execute(versionId: string, userId: string) {
        return this.repository.findDetailedVersion(versionId, userId);
    }
}
