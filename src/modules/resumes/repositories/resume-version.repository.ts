import { prisma } from "@/lib/prisma/prisma";
export class ResumeVersionRepository {
    async getActiveVersions(userId: string) {
        return prisma.resumeVersion.findMany({
            where: {
                resume: {
                    userId,
                },

                status: {
                    not: "ARCHIVED",
                },
            },

            include: {
                resume: true,
            },
        });
    }
}
