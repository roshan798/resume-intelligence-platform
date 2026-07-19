import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { ResumeSimilarityService } from "@/lib/matching/similarity/resume-similarity.service";
import { ResumeParserService } from "@/lib/parsing/pipeline/resume-parser.service";
import { logger } from "@/lib/logger";
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

Do not JSON-encode or escape LaTeX backslashes. TARGET must be an exact, unique substring occurring after \\begin{document}. REPLACEMENT replaces that substring and must preserve the target's existing structure while changing only resume content. Do not target or alter the preamble, styling, section formatting, document class, packages, macros, assets, or commands. Do not invent experience; wording must remain conditional on facts already present. Combine recommendations that modify the same section into one patch. Patch targets must never overlap.`,
            temperature: 0.1,
            maxTokens: 5000,
            jsonMode: false,
        });
        const generated = patchSchema.parse({
            patches: parsePatchResponse(response.text),
        });
        const updatedSource = this.applyPatches(
            draft.latexSource,
            generated.patches,
            { suggestionId, draftVersionId },
        );
        const parsed = await this.parser.parse("LATEX", Buffer.from(updatedSource, "utf8"));

        const applied = await this.suggestions.applyToLatexDraft({
            suggestionId,
            draftVersionId,
            latexSource: updatedSource,
            rawText: parsed.rawText,
            parsedSections:
                parsed.parsedSections as unknown as Prisma.InputJsonValue,
            canonicalKeywords: parsed.canonicalKeywords,
            fingerprintHash: this.similarity.createFingerprint(parsed.rawText),
        });

        logger.info(
            {
                suggestionId,
                draftVersionId,
                patchCount: generated.patches.length,
            },
            "AI suggestions applied to LaTeX draft",
        );

        return applied;
    }

    private applyPatches(
        source: string,
        patches: Array<{ targetText: string; replacementLatex: string }>,
        context: { suggestionId: string; draftVersionId: string },
    ) {
        const normalizedSource = normalizeLineEndings(source);
        const documentStart = normalizedSource.indexOf("\\begin{document}");
        if (documentStart < 0) {
            logger.error(context, "LaTeX draft has no document start marker");
            throw new Error("The LaTeX draft has no \\begin{document} marker.");
        }

        const resolved = patches.map((patch, patchIndex) => {
            if (forbiddenLatex.test(patch.replacementLatex)) {
                logger.warn(
                    { ...context, patchIndex },
                    "Rejected AI LaTeX patch containing a protected command",
                );
                throw new Error("The generated patch attempted to change protected LaTeX commands.");
            }
            const target = normalizeLineEndings(patch.targetText);
            const matches = findTargetMatches(
                normalizedSource,
                target,
                documentStart,
            );
            if (matches.length !== 1) {
                logger.warn(
                    {
                        ...context,
                        patchIndex,
                        matchCount: matches.length,
                        targetLength: target.length,
                        targetPreview: target.slice(0, 160).replaceAll("\n", "\\n"),
                    },
                    "AI LaTeX patch target was not uniquely matched in document body",
                );
                throw new Error(
                    matches.length === 0
                        ? `Patch ${patchIndex + 1} could not find its target in the LaTeX body. The AI changed the anchor text; please try again.`
                        : `Patch ${patchIndex + 1} matched ${matches.length} places in the LaTeX body. It was not applied because the target is ambiguous.`,
                );
            }
            const match = matches[0];
            return {
                ...match,
                patchIndex,
                replacement: normalizeLineEndings(patch.replacementLatex),
            };
        });

        const byPosition = [...resolved].sort(
            (first, second) => first.index - second.index,
        );
        for (let index = 1; index < byPosition.length; index += 1) {
            const previous = byPosition[index - 1];
            const current = byPosition[index];
            if (current.index < previous.index + previous.length) {
                logger.warn(
                    {
                        ...context,
                        firstPatchIndex: previous.patchIndex,
                        secondPatchIndex: current.patchIndex,
                    },
                    "Rejected overlapping AI LaTeX patches",
                );
                throw new Error(
                    `Patches ${previous.patchIndex + 1} and ${current.patchIndex + 1} target overlapping LaTeX content. Nothing was changed; please try again.`,
                );
            }
        }

        let updated = normalizedSource;
        for (const patch of resolved.sort(
            (first, second) => second.index - first.index,
        )) {
            updated = `${updated.slice(0, patch.index)}${patch.replacement}${updated.slice(patch.index + patch.length)}`;
        }
        if (updated.slice(0, updated.indexOf("\\begin{document}")) !== normalizedSource.slice(0, normalizedSource.indexOf("\\begin{document}"))) {
            logger.error(context, "Rejected AI LaTeX patch that changed the preamble");
            throw new Error("The LaTeX preamble cannot be modified by resume suggestions.");
        }
        return updated;
    }
}

function normalizeLineEndings(value: string): string {
    return value.replace(/\r\n?/gu, "\n");
}

function findTargetMatches(
    source: string,
    target: string,
    documentStart: number,
): Array<{ index: number; length: number }> {
    const bodyStart = documentStart + "\\begin{document}".length;
    const body = source.slice(bodyStart);
    const exactMatches = findExactMatches(body, target).map((match) => ({
        index: match.index + bodyStart,
        length: match.length,
    }));
    if (exactMatches.length > 0) return exactMatches;

    const tokens = target.trim().split(/\s+/u).filter(Boolean);
    if (tokens.length === 0) return [];
    const flexiblePattern = tokens.map(escapeRegExp).join("\\s+");
    return [...body.matchAll(new RegExp(flexiblePattern, "gu"))].map(
        (match) => ({
            index: (match.index ?? 0) + bodyStart,
            length: match[0].length,
        }),
    );
}

function findExactMatches(
    source: string,
    target: string,
): Array<{ index: number; length: number }> {
    const matches: Array<{ index: number; length: number }> = [];
    let position = source.indexOf(target);
    while (position >= 0) {
        matches.push({ index: position, length: target.length });
        position = source.indexOf(target, position + Math.max(target.length, 1));
    }
    return matches;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
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
