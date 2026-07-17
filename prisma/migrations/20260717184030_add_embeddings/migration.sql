-- Enable the pgvector extension in your Supabase database
CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "jd_analyses" ADD COLUMN     "embedding" vector(1536);

-- AlterTable
ALTER TABLE "resume_versions" ADD COLUMN     "embedding" vector(1536);
