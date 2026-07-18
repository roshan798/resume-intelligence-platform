import { z } from "zod";

export const registerSchema = z
    .object({
        name: z.string().min(2).max(100),

        email: z.email(),

        password: z
            .string()
            .min(8)
            .regex(/[A-Z]/, "Must contain uppercase")
            .regex(/[a-z]/, "Must contain lowercase")
            .regex(/[0-9]/, "Must contain number"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RegisterSchema = z.infer<typeof registerSchema>;
