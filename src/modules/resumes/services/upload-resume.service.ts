import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

import { SupabaseStorage } from "@/lib/storage/supabase-storage";

import { FileAssetRepository } from "@/modules/files/repositories/file-asset.repository";

import { ResumeRepository } from "../repositories/resume.repository";

export class UploadResumeService {
    private storage = new SupabaseStorage();

    private fileRepo = new FileAssetRepository();

    private resumeRepo = new ResumeRepository();

    async execute(
        userId: string,
        input: {
            title: string;
            primaryStack?: string;
            file: File;
        },
    ) {
        const extension = input.file.name.split(".").pop();
        const storagePath = `${userId}/${randomUUID()}.${extension}`;

        // 1. Upload the file *before* starting the database transaction
        const uploadResult = await this.storage.upload({
            path: storagePath,
            file: input.file,
        });

        try {
            // 2. Wrap the database operations inside a transaction
            return await prisma.$transaction(async () => {
                const asset = await this.fileRepo.create({
                    userId,
                    storageRef: uploadResult.storageRef,
                    mimeType: uploadResult.mimeType,
                    sizeBytes: uploadResult.sizeBytes,
                });

                const resume = await this.resumeRepo.createResume(
                    userId,
                    input.title,
                    input.primaryStack,
                );

                const version = await this.resumeRepo.createVersion({
                    resumeId: resume.id,
                    fileAssetId: asset.id,
                    sourceFormat:
                        extension === "pdf"
                            ? "PDF"
                            : extension === "docx"
                              ? "DOCX"
                              : "LATEX",
                });

                logger.info(
                    {
                        resumeId: resume.id,
                        versionId: version.id,
                    },
                    "Resume uploaded successfully",
                );

                return {
                    resume,
                    version,
                };
            });
        } catch (error) {
            // 3. CRITICAL CLEANUP: If any DB insertions fail, drop the file so it isn't orphaned
            logger.error(
                { storagePath, error },
                "Database transaction failed. Cleaning up uploaded file from storage.",
            );

            try {
                // Assuming your storage class has a delete method
                await this.storage.delete(storagePath);
            } catch (deleteError) {
                logger.error(
                    { storagePath, deleteError },
                    "Failed to delete orphaned file during cleanup",
                );
            }

            // Propagate the original database error back up to your API route response
            throw error;
        }
    }
}
