import { prisma } from "@/lib/prisma/prisma";

export class ResumeRepository {
    async create(data: {
        userId: string;
        title: string;
        primaryStack?: string;
    }) {
        return prisma.resume.create({
            data,
        });
    }

    async findByUserId(userId: string) {
        return prisma.resume.findMany({
            where: {
                userId,
            },
            include: {
                versions: true,
                tags: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
    }
}
