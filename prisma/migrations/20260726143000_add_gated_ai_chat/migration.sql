CREATE TYPE "AIChatRole" AS ENUM ('USER', 'ASSISTANT');

ALTER TABLE "users"
ADD COLUMN "aiChatEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "ai_chat_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_chat_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_chat_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AIChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "provider" "AIProvider",
    "modelUsed" TEXT,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_chat_conversations_userId_updatedAt_idx"
ON "ai_chat_conversations"("userId", "updatedAt");

CREATE INDEX "ai_chat_messages_conversationId_createdAt_idx"
ON "ai_chat_messages"("conversationId", "createdAt");

ALTER TABLE "ai_chat_conversations"
ADD CONSTRAINT "ai_chat_conversations_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ai_chat_messages"
ADD CONSTRAINT "ai_chat_messages_conversationId_fkey"
FOREIGN KEY ("conversationId") REFERENCES "ai_chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
