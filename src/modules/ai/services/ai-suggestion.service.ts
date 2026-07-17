import { Prisma } from "@prisma/client";
import {
    AIProvider,
    AISuggestionStatus,
    AISuggestionType,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export class AISuggestionService {
    async saveSuggestion(data: {
        resumeVersionId: string;
        jdAnalysisId?: string;

        featureType: AISuggestionType;

        inputPayload: Prisma.InputJsonValue;
        outputPayload: Prisma.InputJsonValue;

        provider: AIProvider;

        modelUsed: string;
    }) {
        return prisma.aISuggestion.create({
            data: {
                resumeVersionId: data.resumeVersionId,
                jdAnalysisId: data.jdAnalysisId,

                featureType: data.featureType,

                inputPayload: data.inputPayload,
                outputPayload: data.outputPayload,

                provider: data.provider,

                modelUsed: data.modelUsed,

                status: AISuggestionStatus.PROPOSED,
            },
        });
    }
}
