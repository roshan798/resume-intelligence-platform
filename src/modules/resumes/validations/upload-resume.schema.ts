import { z } from "zod";

import { StorageConfig } from "@/lib/config/storage.config";

export type ResumeSourceFormat = "PDF" | "DOCX" | "LATEX";

export const uploadResumeSchema = z.object({
    title: z.string().trim().min(3).max(100),

    primaryStack: z.string().trim().optional(),

    tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
});

export function validateFile(file: File): ResumeSourceFormat {
    const extension = file.name.split(".").pop()?.toLowerCase();

    const maxSize = StorageConfig.maxUploadSizeMb * 1024 * 1024;

    if (file.size > maxSize) {
        throw new Error(
            `File exceeds the ${StorageConfig.maxUploadSizeMb}MB limit.`,
        );
    }

    if (file.size === 0) throw new Error("The uploaded file is empty.");

    if (extension === "pdf" && file.type === "application/pdf") return "PDF";
    if (
        extension === "docx" &&
        file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        return "DOCX";
    }
    if (
        extension === "tex" &&
        ["text/x-tex", "application/x-tex", "text/plain", ""].includes(
            file.type,
        )
    ) {
        return "LATEX";
    }

    throw new Error(
        "Unsupported file type or mismatched extension. Upload a PDF, DOCX, or LaTeX file.",
    );
}
