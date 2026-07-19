import { Prisma } from "@prisma/client";
import {
    ScoringService,
    type ScorableJDKeyword,
} from "../scoring/scoring.service";

// Define the shape of the incoming JD keywords array based on your ScoringService
// Define the subset shape needed from your database ResumeVersion objects
interface ResumeVersionInput {
    id: string;
    canonicalKeywords: Prisma.JsonValue; 
}

export class MatchEngineService {
    private scoring = new ScoringService();

    execute(
        jdKeywords: ScorableJDKeyword[],
        resumeVersions: ResumeVersionInput[],
    ) {
        return (
            resumeVersions
                .map((version) => {
                    // Cast the database JSON type safely to what the scoring engine expects: Record<string, string[]>
                    const keywordsRecord = version.canonicalKeywords as Record<
                        string,
                        string[]
                    >;

                    return {
                        resumeVersionId: version.id,
                        ...this.scoring.score(jdKeywords, keywordsRecord),
                    };
                })
                // TypeScript automatically infers the shape of 'a' and 'b' now, clearing the sort errors!
                .sort((a, b) => b.overallScore - a.overallScore)
        );
    }
}
