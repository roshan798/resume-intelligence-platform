import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface ResumeSimilarityResult {
    id: string;
    resumeId: string;
    title: string;
    versionNumber: number;
    similarity: number;
}

export interface JDSimilarityResult {
    id: string;
    jobDescriptionId: string | null;
    company: string | null;
    roleTitle: string | null;
    similarity: number;
}

export class SemanticSearchRepository {
    findUnembeddedResumes(userId: string, limit = 20) {
        return prisma.$queryRaw<Array<{ id: string; rawText: string }>>(Prisma.sql`
            SELECT rv."id", rv."rawText"
            FROM "resume_versions" rv
            JOIN "resumes" r ON r."id" = rv."resumeId"
            WHERE rv."embedding" IS NULL AND rv."rawText" <> ''
              AND rv."status" <> 'ARCHIVED' AND r."userId" = ${userId}
            ORDER BY rv."updatedAt" DESC
            LIMIT ${limit}
        `);
    }

    findUnembeddedJDs(userId: string, limit = 20) {
        return prisma.$queryRaw<Array<{ id: string; rawText: string }>>(Prisma.sql`
            SELECT "id", "rawText"
            FROM "jd_analyses"
            WHERE "embedding" IS NULL AND "rawText" <> '' AND "userId" = ${userId}
            ORDER BY "updatedAt" DESC
            LIMIT ${limit}
        `);
    }

    async updateResumeEmbedding(id: string, userId: string, embedding: number[]) {
        const vector = vectorLiteral(embedding);
        await prisma.$executeRaw(Prisma.sql`
            UPDATE "resume_versions" rv
            SET "embedding" = ${vector}::vector
            FROM "resumes" r
            WHERE rv."id" = ${id} AND rv."resumeId" = r."id" AND r."userId" = ${userId}
        `);
    }

    async updateJDEmbedding(id: string, userId: string, embedding: number[]) {
        const vector = vectorLiteral(embedding);
        await prisma.$executeRaw(Prisma.sql`
            UPDATE "jd_analyses"
            SET "embedding" = ${vector}::vector
            WHERE "id" = ${id} AND "userId" = ${userId}
        `);
    }

    findSimilarResumes(embedding: number[], userId: string, limit = 5) {
        const vector = vectorLiteral(embedding);
        return prisma.$queryRaw<ResumeSimilarityResult[]>(Prisma.sql`
            SELECT rv."id", rv."resumeId", r."title", rv."versionNumber",
                   (1 - (rv."embedding" <=> ${vector}::vector))::double precision AS "similarity"
            FROM "resume_versions" rv
            JOIN "resumes" r ON r."id" = rv."resumeId"
            WHERE rv."embedding" IS NOT NULL AND r."userId" = ${userId}
              AND rv."status" <> 'ARCHIVED'
            ORDER BY rv."embedding" <=> ${vector}::vector
            LIMIT ${limit}
        `);
    }

    findSimilarJDs(embedding: number[], userId: string, limit = 5) {
        const vector = vectorLiteral(embedding);
        return prisma.$queryRaw<JDSimilarityResult[]>(Prisma.sql`
            SELECT "id", "jobDescriptionId", "company", "roleTitle",
                   (1 - ("embedding" <=> ${vector}::vector))::double precision AS "similarity"
            FROM "jd_analyses"
            WHERE "embedding" IS NOT NULL AND "userId" = ${userId}
            ORDER BY "embedding" <=> ${vector}::vector
            LIMIT ${limit}
        `);
    }
}

function vectorLiteral(embedding: number[]): string {
    if (embedding.length !== 1536 || embedding.some((value) => !Number.isFinite(value))) {
        throw new Error("A valid 1536-dimension embedding is required.");
    }
    return `[${embedding.join(",")}]`;
}
