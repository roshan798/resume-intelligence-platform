import { z } from "zod";

const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/x-tex",
    "application/x-tex",
];

export const uploadResumeSchema = z.object({
    title: z.string().trim().min(3).max(100),

    primaryStack: z.string().trim().optional(),

    tags: z.array(z.string()),
});

export function validateFile(file: File) {
    if (!allowedMimeTypes.includes(file.type)) {
        throw new Error("Unsupported file type");
    }

    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {
        throw new Error("File exceeds 20MB limit");
    }
}
