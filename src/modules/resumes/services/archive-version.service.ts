import { prisma } from "@/lib/prisma";

export class ArchiveVersionService {
    async execute(versionId: string, userId: string) {
        const version = await prisma.resumeVersion.findFirst({
            where: {
                id: versionId,
                resume: {
                    userId,
                },
            },
        });

        if (!version) {
            return null;
        }

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
