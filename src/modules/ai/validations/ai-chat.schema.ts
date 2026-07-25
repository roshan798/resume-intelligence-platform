import { z } from "zod";

export const chatResponseStyleSchema = z.enum([
    "CONCISE",
    "BALANCED",
    "DETAILED",
    "COACHING",
]);

export const sendChatMessageSchema = z.object({
    conversationId: z.string().uuid().nullable().optional(),
    message: z.string().trim().min(1).max(4_000),
    responseStyle: chatResponseStyleSchema.optional(),
});

export const renameChatConversationSchema = z.object({
    title: z.string().trim().min(1, "Enter a conversation title.").max(80),
});

export const updateChatResponseStyleSchema = z.object({
    responseStyle: chatResponseStyleSchema,
});
