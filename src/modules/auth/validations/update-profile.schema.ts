import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters.")
        .max(80, "Name cannot exceed 80 characters."),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
