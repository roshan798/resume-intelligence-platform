import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { ResumeSimilarityService } from "@/lib/matching/similarity/resume-similarity.service";
import { ResumeParserService } from "@/lib/parsing/pipeline/resume-parser.service";
import { ResumeVersionRepository } from "@/modules/resumes/repositories/resume-version.repository";

import { AISuggestionRepository } from "../repositories/ai-suggestion.repository";
import { AIGatewayService } from "./ai-gateway.service";

const patchSchema = z.object({
    patches: z.array(z.object({
        targetText: z.string().min(1).max(2000),
        replacementLatex: z.string().min(1).max(4000),
    })).min(1).max(20),
});

const forbiddenLatex = /\\(?:documentclass|usepackage|input|include|write|openin|openout|read|immediate|includegraphics|bibliography|addbibresource|newcommand|renewcommand|def|catcode|csname|special|shellescape)\b/iu;

export class ApplyLatexSuggestionService {
    private readonly suggestions = new AISuggestionRepository();
    private readonly versions = new ResumeVersionRepository();
    private readonly gateway = new AIGatewayService();
    private readonly parser = new ResumeParserService();
    private readonly similarity = new ResumeSimilarityService();

    async execute(suggestionId: string, draftVersionId: string, userId: string) {
        const [suggestion, draft] = await Promise.all([
            this.suggestions.findApplicable(suggestionId, draftVersionId, userId),
            this.versions.findByIdAndUser(draftVersionId, userId),
        ]);
        if (!suggestion || !draft) return null;
        if (
            draft.status !== "TAILORED_DRAFT" ||
            draft.sourceFormat !== "LATEX" ||
            !draft.latexSource?.trim() ||
            draft.parentVersionId !== suggestion.resumeVersionId ||
            draft.jdSnapshotId !== suggestion.jdAnalysisId
        ) {
            throw new Error("This suggestion does not belong to the selected LaTeX draft.");
        }

        const recommendations = readRecommendations(suggestion.outputPayload);
        if (recommendations.length === 0) throw new Error("The suggestion has no applicable recommendations.");
        const response = await this.gateway.generate({
            systemPrompt:
                "You edit resume content in LaTeX using exact anchor replacements. Preserve truthfulness, commands, layout, styling, and the entire preamble. Never add packages or commands that access files or the shell. Return only the requested marker format, without Markdown fences.",
            prompt: `Create minimal LaTeX content patches for the accepted recommendations.

RECOMMENDATIONS:
${JSON.stringify(recommendations)}

LATEX SOURCE:
${draft.latexSource.slice(0, 30000)}

Return one or more patches using exactly this raw-text format:
<<<PATCH>>>
<<<TARGET>>>
exact LaTeX source substring
<<</TARGET>>>
<<<REPLACEMENT>>>
replacement LaTeX source
<<</REPLACEMENT>>>
<<</PATCH>>>

Do not JSON-encode or escape LaTeX backslashes. TARGET must be an exact, unique substring occurring after \\begin{document}. REPLACEMENT replaces that substring and must preserve the target's existing structure while changing only resume content. Do not target or alter the preamble, styling, section formatting, document class, packages, macros, assets, or commands. Do not invent experience; wording must remain conditional on facts already present.`,
            temperature: 0.1,
            maxTokens: 5000,
            jsonMode: false,
        });
        const generated = patchSchema.parse({
            patches: parsePatchResponse(response.text),
        });
        const updatedSource = this.applyPatches(draft.latexSource, generated.patches);
        const parsed = await this.parser.parse("LATEX", Buffer.from(updatedSource, "utf8"));

        return this.suggestions.applyToLatexDraft({
            suggestionId,
            draftVersionId,
            latexSource: updatedSource,
            rawText: parsed.rawText,
            parsedSections:
                parsed.parsedSections as unknown as Prisma.InputJsonValue,
            canonicalKeywords: parsed.canonicalKeywords,
            fingerprintHash: this.similarity.createFingerprint(parsed.rawText),
        });
    }

    private applyPatches(source: string, patches: Array<{ targetText: string; replacementLatex: string }>) {
        let updated = source;
        for (const patch of patches) {
            if (forbiddenLatex.test(patch.replacementLatex)) {
                throw new Error("The generated patch attempted to change protected LaTeX commands.");
            }
            const documentStart = updated.indexOf("\\begin{document}");
            const first = updated.indexOf(patch.targetText);
            const last = updated.lastIndexOf(patch.targetText);
            if (documentStart < 0 || first <= documentStart || first !== last) {
                throw new Error("The generated patch did not identify one safe document-body target.");
            }
            updated = `${updated.slice(0, first)}${patch.replacementLatex}${updated.slice(first + patch.targetText.length)}`;
        }
        if (updated.slice(0, updated.indexOf("\\begin{document}")) !== source.slice(0, source.indexOf("\\begin{document}"))) {
            throw new Error("The LaTeX preamble cannot be modified by resume suggestions.");
        }
        return updated;
    }
}

function readRecommendations(value: unknown): unknown[] {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return [];
    const recommendations = (value as Record<string, unknown>).recommendations;
    return Array.isArray(recommendations) ? recommendations : [];
}

function parsePatchResponse(
    value: string,
): Array<{ targetText: string; replacementLatex: string }> {
    const patches: Array<{
        targetText: string;
        replacementLatex: string;
    }> = [];
    const pattern =
        /<<<PATCH>>>\s*\r?\n<<<TARGET>>>\r?\n([\s\S]*?)\r?\n<<<\/TARGET>>>\s*\r?\n<<<REPLACEMENT>>>\r?\n([\s\S]*?)\r?\n<<<\/REPLACEMENT>>>\s*\r?\n<<<\/PATCH>>>/gu;

    for (const match of value.matchAll(pattern)) {
        patches.push({
            targetText: match[1],
            replacementLatex: match[2],
        });
    }

    if (patches.length === 0) {
        throw new Error(
            "The AI provider returned an invalid LaTeX patch. Please try applying the suggestion again.",
        );
    }

    return patches;
}
