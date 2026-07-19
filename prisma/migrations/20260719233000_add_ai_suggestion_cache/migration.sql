ALTER TABLE "ai_suggestions"
ADD COLUMN "promptVersion" TEXT,
ADD COLUMN "cacheKey" TEXT;

CREATE UNIQUE INDEX "ai_suggestions_cacheKey_key"
ON "ai_suggestions"("cacheKey");

CREATE INDEX "ai_suggestions_resumeVersionId_jdAnalysisId_promptVersion_idx"
ON "ai_suggestions"("resumeVersionId", "jdAnalysisId", "promptVersion");
