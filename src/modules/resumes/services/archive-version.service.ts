import { prisma } from "@/lib/prisma";

export class ArchiveVersionService {
    async execute(versionId: string) {
        return prisma.resumeVersion.update({
            where: {
                id: versionId,
            },

            data: {
                status: "ARCHIVED",
            },
        });
    }
}
