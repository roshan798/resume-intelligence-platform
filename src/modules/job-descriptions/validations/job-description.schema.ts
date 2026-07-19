import { z } from "zod";

const optionalText = (maxLength: number) =>
    z.string().trim().max(maxLength).optional().nullable();

const optionalWebUrl = z
    .url()
    .max(2_000)
    .refine((value) => {
        const protocol = new URL(value).protocol;
        return protocol === "http:" || protocol === "https:";
    }, "Source URL must use HTTP or HTTPS.")
    .optional()
    .nullable();

export const createJobDescriptionSchema = z.object({
    company: optionalText(120),
    roleTitle: z.string().trim().min(2).max(160),
    location: optionalText(120),
    sourceUrl: optionalWebUrl,
    experienceRequirements: optionalText(2_000),
    rawText: z.string().trim().min(50).max(100_000),
});

export const updateJobDescriptionSchema = createJobDescriptionSchema.omit({
    rawText: true,
});

export const createJobDescriptionSnapshotSchema = z.object({
    rawText: z.string().trim().min(50).max(100_000),
});

export type CreateJobDescriptionInput = z.infer<
    typeof createJobDescriptionSchema
>;
export type UpdateJobDescriptionInput = z.infer<
    typeof updateJobDescriptionSchema
>;
