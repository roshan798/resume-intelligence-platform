import { prisma } from "@/lib/prisma";

export class FinalizeVersionService {
    async execute(versionId: string) {
        return prisma.resumeVersion.update({
            where: {
                id: versionId,
            },

            data: {
                status: "FINAL",
            },
        });
    }
}
