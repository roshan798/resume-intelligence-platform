import { z } from "zod";

export const sendChatMessageSchema = z.object({
    conversationId: z.string().uuid().nullable().optional(),
    message: z.string().trim().min(1).max(4_000),
});
