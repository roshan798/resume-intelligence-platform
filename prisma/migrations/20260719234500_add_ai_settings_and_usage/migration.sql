CREATE TABLE "ai_settings" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL,
    "preferredProvider" "AIProvider" NOT NULL DEFAULT 'GEMINI',
    "fallbackEnabled" BOOLEAN NOT NULL DEFAULT true,
    "featureModels" JSONB NOT NULL DEFAULT '{}',
    "monthlyTokenLimit" INTEGER DEFAULT 200000,
    "monthlyBudgetMicros" INTEGER,
    "perRequestMaxTokens" INTEGER NOT NULL DEFAULT 4000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_settings_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ai_usage" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "operation" TEXT NOT NULL,
    "provider" "AIProvider" NOT NULL, "modelUsed" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0, "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0, "estimatedCostMicros" INTEGER NOT NULL DEFAULT 0,
    "requestId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ai_settings_userId_key" ON "ai_settings"("userId");
CREATE INDEX "ai_usage_userId_createdAt_idx" ON "ai_usage"("userId", "createdAt");
CREATE INDEX "ai_usage_requestId_idx" ON "ai_usage"("requestId");
ALTER TABLE "ai_settings" ADD CONSTRAINT "ai_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
