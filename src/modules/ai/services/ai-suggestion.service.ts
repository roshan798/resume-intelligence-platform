import {
    AIProvider,
    AISuggestionStatus,
    AISuggestionType,
    type Prisma,
} from "@prisma/client";
import { z } from "zod";

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

        const response = await this.gateway.generate({
            systemPrompt:
                "You are a cautious resume advisor. Never invent skills, employers, projects, metrics, or experience. Recommendations are advisory and require explicit user acceptance.",
            prompt: `Create targeted resume recommendations from these deterministic findings.

Missing keywords: ${missingKeywords.join(", ") || "None"}
Weakly placed keywords: ${weakKeywords.join(", ") || "None"}

JOB DESCRIPTION:
${context.jdAnalysis.rawText.slice(0, 12000)}

CURRENT RESUME:
${context.resumeVersion.rawText.slice(0, 12000)}

Return a JSON object with a recommendations array. Each item must have keyword, reason, suggestedSection (summary, skills, experience, or projects), suggestion, and safetyNote. For a missing skill, explicitly tell the user to add it only if they genuinely possess that experience. Do not rewrite the resume and do not claim unsupported experience.`,
            temperature: 0.2,
            maxTokens: 3000,
            jsonMode: true,
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
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
            estimatedCostMicros: 0,
        });
    }

    list(userId: string) {
        return this.repository.findAllByUser(userId);
    }

    updateStatus(id: string, userId: string, status: "ACCEPTED" | "REJECTED") {
        return this.repository.updateStatus(id, userId, AISuggestionStatus[status]);
    }
}

function readStrings(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];
}
