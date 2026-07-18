import { prisma } from "@/lib/prisma/prisma";
export interface ResumeSimilarityResult {
    id: string;
    title: string;
    similarity: number;
}
export class SemanticSearchRepository {
    async findSimilarResumes(
        embedding: number[],
        userId: string,
        limit = 5,
    ): Promise<ResumeSimilarityResult[]> {
        const vector = `[${embedding.join(",")}]`;

        return prisma.$queryRawUnsafe(`
      SELECT
        rv.id,
        r.title,
        1 - (rv.embedding <=> '${vector}') AS similarity
      FROM resume_versions rv
      JOIN resumes r ON r.id = rv."resumeId"
      WHERE rv.embedding IS NOT NULL
        AND r."userId" = '${userId}'
      ORDER BY rv.embedding <=> '${vector}'
      LIMIT ${limit}
    `);
    }

    async findSimilarJDs(embedding: number[], userId: string, limit = 5) {
        const vector = `[${embedding.join(",")}]`;

        return prisma.$queryRawUnsafe(`
      SELECT
        id,
        company,
        role_title,
        1 - (embedding <=> '${vector}') AS similarity
      FROM jd_analyses
      WHERE embedding IS NOT NULL
        AND "userId" = '${userId}'
      ORDER BY embedding <=> '${vector}'
      LIMIT ${limit}
    `);
    }
}
