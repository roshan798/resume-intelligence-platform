import { z } from "zod";

export const updateResumeSchema = z.object({
    title: z.string().trim().min(3).max(100),
    primaryStack: z.string().trim().max(100).nullable(),
    tags: z.array(z.string().trim().min(1).max(30)).max(10),
});

export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
