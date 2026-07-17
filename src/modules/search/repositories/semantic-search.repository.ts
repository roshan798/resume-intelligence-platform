import { prisma } from "@/lib/prisma/prisma";
export interface ResumeSimilarityResult {
    id: string;
    title: string;
    similarity: number;
}
export class SemanticSearchRepository {
    async findSimilarResumes(
        embedding: number[],
        limit = 5,
    ): Promise<ResumeSimilarityResult[]> {
        const vector = `[${embedding.join(",")}]`;

        return prisma.$queryRawUnsafe(`
      SELECT
        id,
        resume_id,
        1 - (embedding <=> '${vector}') AS similarity
      FROM resume_versions
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> '${vector}'
      LIMIT ${limit}
    `);
    }

    async findSimilarJDs(embedding: number[], limit = 5) {
        const vector = `[${embedding.join(",")}]`;

        return prisma.$queryRawUnsafe(`
      SELECT
        id,
        company,
        role_title,
        1 - (embedding <=> '${vector}') AS similarity
      FROM jd_analyses
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> '${vector}'
      LIMIT ${limit}
    `);
    }
}
