import type { Prisma } from "@prisma/client";

import { MatchEngineService } from "@/lib/matching/engine/match-engine.service";
import type { ScorableJDKeyword } from "@/lib/matching/scoring/scoring.service";
import { JDAnalysisRepository } from "@/modules/jd/repositories/jd-analysis.repository";
import { ResumeVersionRepository } from "@/modules/resumes/repositories/resume-version.repository";

import { MatchResultRepository } from "../repositories/match-result.repository";

export class RunMatchAnalysisService {
    private readonly engine = new MatchEngineService();
    private readonly jdAnalyses = new JDAnalysisRepository();
    private readonly resumes = new ResumeVersionRepository();
    private readonly matches = new MatchResultRepository();

    async execute(jdAnalysisId: string, userId: string) {
        const analysis = await this.jdAnalyses.findByIdAndUser(
            jdAnalysisId,
            userId,
        );
        if (!analysis) return null;

        const jdKeywords = this.readKeywords(analysis.parsedKeywords);
        const resumeVersions = await this.resumes.getActiveVersions(userId);
        const engineResults = this.engine.execute(jdKeywords, resumeVersions);
        const results: Prisma.MatchResultCreateManyInput[] = engineResults.map(
            (result) => ({
                jdAnalysisId,
                resumeVersionId: result.resumeVersionId,
                overallScore: result.overallScore,
                matchedKeywords: result.matchedKeywords,
                missingKeywords: result.missingKeywords,
                weakKeywords: result.weakKeywords,
                sectionScores:
                    result.sectionScores as unknown as Prisma.InputJsonValue,
                formattingHealth: {},
            }),
        );

        await this.matches.replaceForAnalysis(jdAnalysisId, results);
        return { count: results.length };
    }

    private readKeywords(value: Prisma.JsonValue): ScorableJDKeyword[] {
        if (!Array.isArray(value)) return [];

        return value.flatMap((item) => {
            if (typeof item !== "object" || item === null || Array.isArray(item)) {
                return [];
            }
            const keyword = item.keyword;
            const importance = item.importance;
            const requirement = item.requirement;
            if (typeof keyword !== "string" || typeof importance !== "number") {
                return [];
            }

            return [{
                keyword,
                importance,
                requirement:
                    requirement === "REQUIRED" ||
                    requirement === "PREFERRED" ||
                    requirement === "CONTEXT"
                        ? requirement
                        : undefined,
            }];
        });
    }
}
