CREATE TYPE "AIChatResponseStyle" AS ENUM (
    'CONCISE',
    'BALANCED',
    'DETAILED',
    'COACHING'
);

ALTER TABLE "ai_chat_conversations"
ADD COLUMN "responseStyle" "AIChatResponseStyle" NOT NULL DEFAULT 'BALANCED';
