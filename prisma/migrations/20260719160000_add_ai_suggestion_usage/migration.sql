ALTER TABLE "ai_suggestions"
ADD COLUMN "promptTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "completionTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "totalTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "estimatedCostMicros" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "ai_suggestions_status_createdAt_idx"
ON "ai_suggestions"("status", "createdAt");
