import { JDParserService } from "@/lib/matching/jd/jd-parser.service";

import { MatchEngineService } from "@/lib/matching/engine/match-engine.service";

import { JDAnalysisRepository } from "../repositories/jd-analysis.repository";

import { ResumeVersionRepository } from "@/modules/resumes/repositories/resume-version.repository";

import { MatchPersistenceService } from "./match-persistence.service";

export class AnalyzeJDService {
    private jdParser = new JDParserService();

    private matchEngine = new MatchEngineService();

    private jdRepository = new JDAnalysisRepository();

    private resumeRepository = new ResumeVersionRepository();

    private persistence = new MatchPersistenceService();

    async execute(
        userId: string,
        request: {
            rawText: string;
            company?: string;
            roleTitle?: string;
        },
    ) {
        const parsedJD = this.jdParser.parse(request.rawText);

        const jdAnalysis = await this.jdRepository.create({
            userId,

            rawText: request.rawText,

            company: request.company,

            roleTitle: request.roleTitle,

            parsedKeywords: parsedJD.keywords,
        });

        const resumeVersions =
            await this.resumeRepository.getActiveVersions(userId);

        const results = this.matchEngine.execute(
            parsedJD.keywords,
            resumeVersions,
        );

        await this.persistence.persist(jdAnalysis.id, results);

        return {
            jdAnalysisId: jdAnalysis.id,

            matches: results.map((result) => ({
                ...result,

                confidence:
                    result.overallScore >= 80
                        ? "HIGH"
                        : result.overallScore >= 60
                          ? "MEDIUM"
                          : "LOW",
            })),
        };
    }
}
