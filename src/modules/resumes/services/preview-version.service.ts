import type { SourceFormat } from "@prisma/client";

import type { FileStorage } from "@/lib/storage/file-storage.interface";

const PDF_MIME_TYPE = "application/pdf";
const PREVIEW_URL_TTL_SECONDS = 5 * 60;

interface PreviewSource {
    sourceFormat: SourceFormat;
    fileAsset: {
        storageRef: string;
        mimeType: string;
        userId: string;
    } | null;
}

interface PreviewSourceRepository {
    findPreviewSource(
        versionId: string,
        userId: string,
    ): Promise<PreviewSource | null>;
}

interface PreviewVersionInput {
    versionId: string;
    userId: string;
}

export class PreviewNotFoundError extends Error {}

export class PreviewUnsupportedError extends Error {}

export class PreviewVersionService {
    constructor(
        private readonly repository: PreviewSourceRepository,
        private readonly storage: FileStorage,
    ) {}

    async execute(input: PreviewVersionInput): Promise<string> {
        const version = await this.repository.findPreviewSource(
            input.versionId,
            input.userId,
        );

        if (!version) {
            throw new PreviewNotFoundError("Resume version not found.");
        }

        if (
            version.sourceFormat !== "PDF" ||
            version.fileAsset?.userId !== input.userId ||
            version.fileAsset?.mimeType.toLowerCase() !== PDF_MIME_TYPE
        ) {
            throw new PreviewUnsupportedError(
                "PDF preview is not available for this resume version.",
            );
        }

        return this.storage.getSignedUrl(
            version.fileAsset.storageRef,
            PREVIEW_URL_TTL_SECONDS,
        );
    }
}
