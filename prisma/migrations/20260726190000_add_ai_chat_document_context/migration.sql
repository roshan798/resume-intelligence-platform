ALTER TABLE "ai_chat_conversations"
ADD COLUMN "resumeVersionId" TEXT,
ADD COLUMN "jdAnalysisId" TEXT;

CREATE INDEX "ai_chat_conversations_resumeVersionId_idx"
ON "ai_chat_conversations"("resumeVersionId");

CREATE INDEX "ai_chat_conversations_jdAnalysisId_idx"
ON "ai_chat_conversations"("jdAnalysisId");

ALTER TABLE "ai_chat_conversations"
ADD CONSTRAINT "ai_chat_conversations_resumeVersionId_fkey"
FOREIGN KEY ("resumeVersionId") REFERENCES "resume_versions"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ai_chat_conversations"
ADD CONSTRAINT "ai_chat_conversations_jdAnalysisId_fkey"
FOREIGN KEY ("jdAnalysisId") REFERENCES "jd_analyses"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
