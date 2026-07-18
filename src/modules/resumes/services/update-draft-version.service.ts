import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/shared/errors/not-found.error";

import { UpdateDraftVersionDto } from "../dto/update-draft-version.dto";
import { ValidationError } from "@/shared/errors/validation.error";

import { Prisma } from "@prisma/client";

export class UpdateDraftVersionService {
    async execute(dto: UpdateDraftVersionDto, userId: string) {
        const version = await prisma.resumeVersion.findFirst({
            where: {
                id: dto.versionId,
                resume: {
                    userId,
                },
            },
        });

        if (!version) {
            throw new NotFoundError("Resume version not found");
        }

        if (version.status !== "TAILORED_DRAFT") {
            throw new ValidationError("Only draft versions can be edited.");
        }

        return prisma.resumeVersion.update({
            where: {
                id: dto.versionId,
            },

            data: {
                ...(dto.rawText !== undefined && {
                    rawText: dto.rawText,
                }),

                ...(dto.latexSource !== undefined && {
                    latexSource: dto.latexSource,
                }),

                ...(dto.parsedSections !== undefined && {
                    parsedSections: dto.parsedSections as Prisma.InputJsonValue,
                }),

                ...(dto.canonicalKeywords !== undefined && {
                    canonicalKeywords: dto.canonicalKeywords,
                }),

                ...(dto.fileAssetId !== undefined && {
                    fileAssetId: dto.fileAssetId,
                }),

                updatedAt: new Date(),
            },
        });
    }
}
