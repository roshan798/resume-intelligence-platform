import { randomUUID } from "node:crypto";

import { logger } from "@/lib/logger";
import { ResumeSimilarityService } from "@/lib/matching/similarity/resume-similarity.service";
import { ResumeParserService } from "@/lib/parsing/pipeline/resume-parser.service";
import { SupabaseStorage } from "@/lib/storage/supabase-storage";
import { ResumeUploadError } from "@/modules/resumes/errors/resume-upload.error";
import { ResumeRepository } from "@/modules/resumes/repositories/resume.repository";
import {
    validateFile,
    type ResumeSourceFormat,
} from "@/modules/resumes/validations/upload-resume.schema";

export class UploadResumeService {
    private readonly storage = new SupabaseStorage();
    private readonly parser = new ResumeParserService();
    private readonly similarity = new ResumeSimilarityService();
    private readonly resumeRepository = new ResumeRepository();

    async execute(
        userId: string,
        input: {
            title: string;
            primaryStack?: string;
            tags?: string[];
            file: File;
        },
    ) {
        let sourceFormat: ResumeSourceFormat;

        try {
            sourceFormat = validateFile(input.file);
        } catch (error) {
            throw new ResumeUploadError(
                "INVALID_RESUME_FILE",
                error instanceof Error ? error.message : "Invalid resume file.",
            );
        }

        const buffer = Buffer.from(await input.file.arrayBuffer());
        this.validateFileSignature(buffer, sourceFormat);

        let parsed: Awaited<ReturnType<ResumeParserService["parse"]>>;

        try {
            parsed = await this.parser.parse(sourceFormat, buffer);
        } catch (error) {
            logger.warn({ err: error, sourceFormat }, "Resume parsing failed");
            throw new ResumeUploadError(
                "RESUME_PARSE_FAILED",
                this.parserErrorMessage(sourceFormat, error),
                422,
            );
        }

        if (!parsed.rawText.trim()) {
            throw new ResumeUploadError(
                "EMPTY_PARSED_RESUME",
                "No readable text was found. The file may be scanned, image-only, encrypted, or empty.",
                422,
            );
        }

        const extension = input.file.name.split(".").pop()?.toLowerCase();
        const storagePath = `${userId}/${randomUUID()}.${extension}`;
        const normalizedTags = [
            ...new Set(
                (input.tags ?? [])
                    .map((tag) => tag.trim().toLowerCase())
                    .filter(Boolean),
            ),
        ];
        const uploadResult = await this.storage.upload({
            path: storagePath,
            file: input.file,
        });

        try {
            const result = await this.resumeRepository.createUploadedResume({
                userId,
                title: input.title.trim(),
                primaryStack: input.primaryStack?.trim() || undefined,
                tags: normalizedTags,
                storageRef: uploadResult.storageRef,
                mimeType: uploadResult.mimeType,
                sizeBytes: uploadResult.sizeBytes,
                sourceFormat,
                rawText: parsed.rawText,
                latexSource:
                    sourceFormat === "LATEX" ? buffer.toString("utf8") : null,
                parsedSections: {
                    summary: parsed.parsedSections.summary,
                    skills: parsed.parsedSections.skills,
                    experience: parsed.parsedSections.experience,
                    projects: parsed.parsedSections.projects,
                    education: parsed.parsedSections.education,
                    certifications: parsed.parsedSections.certifications,
                    others: parsed.parsedSections.others,
                },
                canonicalKeywords: parsed.canonicalKeywords,
                fingerprintHash: this.similarity.createFingerprint(parsed.rawText),
            });

            logger.info(
                {
                    resumeId: result.resume.id,
                    versionId: result.version.id,
                    sourceFormat,
                },
                "Resume uploaded and parsed successfully",
            );

            return result;
        } catch (error) {
            logger.error(
                { storagePath, err: error },
                "Database write failed; deleting uploaded resume asset",
            );

            try {
                await this.storage.delete(storagePath);
            } catch (deleteError) {
                logger.error(
                    { storagePath, err: deleteError },
                    "Failed to delete orphaned resume asset",
                );
            }

            throw error;
        }
    }

    private validateFileSignature(
        buffer: Buffer,
        sourceFormat: ResumeSourceFormat,
    ): void {
        const valid =
            sourceFormat === "PDF"
                ? buffer.subarray(0, 5).toString("ascii") === "%PDF-"
                : sourceFormat === "DOCX"
                  ? buffer.subarray(0, 2).toString("ascii") === "PK"
                  : !buffer.includes(0);

        if (!valid) {
            throw new ResumeUploadError(
                "INVALID_FILE_SIGNATURE",
                "The file contents do not match the selected resume format.",
            );
        }
    }

    private parserErrorMessage(
        sourceFormat: ResumeSourceFormat,
        error: unknown,
    ): string {
        const detail = error instanceof Error ? error.message.toLowerCase() : "";

        if (detail.includes("password") || detail.includes("encrypted")) {
            return "The resume is password-protected or encrypted. Upload an unlocked file.";
        }

        return `The ${sourceFormat} resume could not be parsed. Verify that the file is valid and try again.`;
    }
}
