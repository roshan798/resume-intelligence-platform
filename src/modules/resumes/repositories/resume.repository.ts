import { prisma } from "@/lib/prisma/prisma";

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
}
