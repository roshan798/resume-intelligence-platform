import { prisma } from "@/lib/prisma";

export class FileAssetRepository {
    async create(data: {
        userId: string;
        storageRef: string;
        mimeType: string;
        sizeBytes: number;
    }) {
        return prisma.fileAsset.create({
            data: {
                userId: data.userId,
                storageProvider: "SUPABASE",
                storageRef: data.storageRef,
                mimeType: data.mimeType,
                sizeBytes: data.sizeBytes,
            },
        });
    }
}
