import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "@/generated/prisma";
export class ResumeRepository {
    async createResume(userId: string, title: string, primaryStack?: string) {
        return prisma.resume.create({
            data: {
                userId,
                title,
                primaryStack,
            },
        });
    }

    async createVersion(data: {
        resumeId: string;
        sourceFormat: "PDF" | "DOCX" | "LATEX";
        fileAssetId: string;
    }) {
        return prisma.resumeVersion.create({
            data: {
                resumeId: data.resumeId,
                versionNumber: 1,
                status: "MASTER",
                sourceFormat: data.sourceFormat,
                rawText: "",
                parsedSections: {},
                canonicalKeywords: {},
                fingerprintHash: "",
                fileAssetId: data.fileAssetId,
            },
        });
    }
    async updateParsedData(
        versionId: string,
        parsed: {
            rawText: string;
            parsedSections: Prisma.InputJsonValue;
            canonicalKeywords: Prisma.InputJsonValue;
        },
    ) {
        return prisma.resumeVersion.update({
            where: {
                id: versionId,
            },

            data: {
                rawText: parsed.rawText,

                parsedSections: parsed.parsedSections,

                canonicalKeywords: parsed.canonicalKeywords,
            },
        });
    }
    async createMatchResult(data: {
        jdAnalysisId: string;
        resumeVersionId: string;
        overallScore: number;
        matchedKeywords: string[];
        missingKeywords: string[];
        weakKeywords: string[];
    }) {
        return prisma.matchResult.create({
            data: {
                ...data,
                sectionScores: {},
                formattingHealth: {},
            },
        });
    }
    async getActiveVersions(userId: string) {
        return prisma.resumeVersion.findMany({
            where: {
                resume: {
                    userId,
                },

                status: {
                    not: "ARCHIVED",
                },
            },

            include: {
                resume: true,
            },
        });
    }
}
