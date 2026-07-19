import { MatchResultRepository } from "@/modules/match/repositories/match-result.repository";

import { ResumeVersionRepository } from "../repositories/resume-version.repository";
import { ForkVersionService } from "./fork-version.service";

export class CreateTailoredDraftFromMatchService {
    private readonly matches = new MatchResultRepository();
    private readonly versions = new ResumeVersionRepository();
    private readonly fork = new ForkVersionService();

    async execute(matchResultId: string, userId: string) {
        const match = await this.matches.getByIdAndUser(matchResultId, userId);
        if (!match) return null;
        if (match.resumeVersion.sourceFormat !== "LATEX" || !match.resumeVersion.latexSource?.trim()) {
            throw new Error("Automatic suggestion application requires an uploaded LaTeX source.");
        }

        const existing = await this.versions.findTailoredDraft(
            match.resumeVersionId,
            match.jdAnalysisId,
            userId,
        );
        if (existing) return existing;

        return this.fork.execute(
            match.resumeVersionId,
            userId,
            match.jdAnalysisId,
        );
    }
}
