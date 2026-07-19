import { ResumeSimilarityService } from "@/lib/matching/similarity/resume-similarity.service";
import { ResumeParserService } from "@/lib/parsing/pipeline/resume-parser.service";
import { ResumeVersionRepository } from "@/modules/resumes/repositories/resume-version.repository";
import { Prisma } from "@prisma/client";

export class ReparseVersionService {
    private readonly repository = new ResumeVersionRepository();
    private readonly parser = new ResumeParserService();
    private readonly similarity = new ResumeSimilarityService();

    async execute(versionId: string, userId: string) {
        const version = await this.repository.findByIdAndUser(
            versionId,
            userId,
        );

        if (!version) return null;

        if (version.sourceFormat !== "LATEX" || !version.latexSource) {
            throw new Error("Only LaTeX versions with saved source can be reparsed.");
        }

        const parsed = await this.parser.parse(
            "LATEX",
            Buffer.from(version.latexSource, "utf8"),
        );

        return this.repository.updateParsedContent(version.id, {
            rawText: parsed.rawText,
            parsedSections:
                parsed.parsedSections as unknown as Prisma.InputJsonValue,
            canonicalKeywords: parsed.canonicalKeywords,
            fingerprintHash: this.similarity.createFingerprint(parsed.rawText),
        });
    }
}
