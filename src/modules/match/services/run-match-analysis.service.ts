import { MatchEngineService } from "@/lib/matching/engine/match-engine.service";
import { ResumeVersionRepository } from "@/modules/resumes/repositories/resume-version.repository";
import { MatchResultRepository } from "../repositories/match-result.repository";
import { Prisma } from "@prisma/client";

export class RunMatchAnalysisService {
    private engine = new MatchEngineService();
    private resumes = new ResumeVersionRepository();
    private matches = new MatchResultRepository();

    // Fix 1: Add type for parsedKeywords parameter
    async execute(
        jdAnalysisId: string,
        parsedKeywords: Prisma.JsonValue,
        userId: string,
    ) {
        const resumeVersions = await this.resumes.getActiveVersions(userId);

        // Safely cast parsedKeywords to the array format expected by the match engine
        const jdKeywordsArray = parsedKeywords as {
            keyword: string;
            importance: number;
        }[];

        // Fix 2: Use the existing .execute method on the engine passing the arrays direct
        const engineResults = this.engine.execute(
            jdKeywordsArray,
            resumeVersions,
        );

        // Map the structured scoring array into database rows matching your schema constraints
        const results = engineResults.map((result) => ({
            jdAnalysisId,
            resumeVersionId: result.resumeVersionId,
            overallScore: result.overallScore,
            matchedKeywords: result.matchedKeywords,
            missingKeywords: result.missingKeywords,
            weakKeywords: result.weakKeywords,
            sectionScores: {}, // Matches schema requirements
            formattingHealth: {}, // Matches schema requirements
        }));

        // Write the records to the database in a single transaction-safe batch operation
        await this.matches.createMany(results);

        return results;
    }
}
