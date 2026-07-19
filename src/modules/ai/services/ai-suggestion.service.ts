import {
    AIProvider,
    AISuggestionStatus,
    AISuggestionType,
    type Prisma,
} from "@prisma/client";
import { createHash } from "node:crypto";
import { z } from "zod";

import { logger } from "@/lib/logger";

import { AISuggestionRepository } from "../repositories/ai-suggestion.repository";
import { AIGatewayService } from "./ai-gateway.service";

const outputSchema = z.object({
    recommendations: z.array(
        z.object({
            keyword: z.string().min(1),
            reason: z.string().min(1),
            suggestedSection: z.enum(["summary", "skills", "experience", "projects"]),
            suggestion: z.string().min(1),
            safetyNote: z.string().min(1),
        }),
    ).max(20),
});

const PROMPT_VERSION = "missing-keywords-v2";

export class AISuggestionService {
    private readonly repository = new AISuggestionRepository();
    private readonly gateway = new AIGatewayService();

    async generateFromMatch(matchResultId: string, userId: string) {
        const context = await this.repository.findMatchContext(matchResultId, userId);
        if (!context) return null;

        const missingKeywords = readStrings(context.missingKeywords);
        const weakKeywords = readStrings(context.weakKeywords);
        if (missingKeywords.length === 0 && weakKeywords.length === 0) {
            throw new Error("This match has no missing or weak keywords to address.");
        }

        const cacheKey = createHash("sha256")
            .update(
                JSON.stringify({
                    promptVersion: PROMPT_VERSION,
                    matchResultId: context.id,
                    resumeVersionId: context.resumeVersion.id,
                    jdAnalysisId: context.jdAnalysis.id,
                    missingKeywords,
                    weakKeywords,
                }),
            )
            .digest("hex");
        const cached = await this.repository.findByCacheKey(cacheKey, userId);
        if (cached) {
            logger.info(
                { cacheKey, suggestionId: cached.id, matchResultId },
                "Reused cached AI suggestion",
            );
            return cached;
        }

        const relevantKeywords = [...new Set([...missingKeywords, ...weakKeywords])];
        const jobContext = compactContext(
            context.jdAnalysis.rawText,
            relevantKeywords,
            5_000,
        );
        const resumeContext = compactContext(
            context.resumeVersion.rawText,
            relevantKeywords,
            5_000,
        );

        const response = await this.gateway.generate({
            operation: "match-suggestions",
            systemPrompt:
                "You are a cautious resume advisor. Never invent skills, employers, projects, metrics, or experience. Recommendations are advisory and require explicit user acceptance.",
            prompt: `Create targeted resume recommendations from these deterministic findings.

Missing keywords: ${missingKeywords.join(", ") || "None"}
Weakly placed keywords: ${weakKeywords.join(", ") || "None"}

JOB DESCRIPTION:
${jobContext}

CURRENT RESUME:
${resumeContext}

Return a JSON object with a recommendations array. Each item must have keyword, reason, suggestedSection (summary, skills, experience, or projects), suggestion, and safetyNote. For a missing skill, explicitly tell the user to add it only if they genuinely possess that experience. Do not rewrite the resume and do not claim unsupported experience.`,
            temperature: 0.2,
            maxTokens: 1200,
            jsonMode: true,
            timeoutMs: 30_000,
        });
        const parsed = outputSchema.parse(JSON.parse(response.text));
        const usage = response.usage ?? {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
        };

        return this.repository.create({
            resumeVersionId: context.resumeVersion.id,
            jdAnalysisId: context.jdAnalysis.id,
            featureType: AISuggestionType.MISSING_KEYWORDS,
            inputPayload: {
                matchResultId: context.id,
                missingKeywords,
                weakKeywords,
            },
            outputPayload: parsed as Prisma.InputJsonValue,
            status: AISuggestionStatus.PROPOSED,
            provider: response.provider === "GEMINI" ? AIProvider.GEMINI : AIProvider.GROQ,
            modelUsed: response.model,
            promptVersion: PROMPT_VERSION,
            cacheKey,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
            estimatedCostMicros: 0,
        });
    }

    list(userId: string) {
        return this.repository.findAllByUser(userId);
    }

    listForDraft(parentVersionId: string, jdSnapshotId: string, userId: string) {
        return this.repository.findForDraft(parentVersionId, jdSnapshotId, userId);
    }

    updateStatus(
        id: string,
        userId: string,
        status: "ACCEPTED" | "REJECTED" | "MANUALLY_APPLIED",
    ) {
        return this.repository.updateStatus(id, userId, AISuggestionStatus[status]);
    }
}

function compactContext(
    text: string,
    keywords: string[],
    maxCharacters: number,
): string {
    if (text.length <= maxCharacters) return text;
    const normalizedKeywords = keywords.map((keyword) => keyword.toLocaleLowerCase());
    const lines = text.split(/\r?\n/u).map((line, index) => ({
        line: line.trim(),
        index,
        score: normalizedKeywords.reduce(
            (score, keyword) =>
                score + (line.toLocaleLowerCase().includes(keyword) ? 1 : 0),
            0,
        ),
    })).filter((item) => item.line);
    const selected = lines
        .sort((first, second) => second.score - first.score || first.index - second.index)
        .reduce<typeof lines>((result, item) => {
            const length = result.reduce((sum, entry) => sum + entry.line.length + 1, 0);
            if (length + item.line.length <= maxCharacters) result.push(item);
            return result;
        }, [])
        .sort((first, second) => first.index - second.index);
    return selected.map((item) => item.line).join("\n");
}

function readStrings(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];
}
