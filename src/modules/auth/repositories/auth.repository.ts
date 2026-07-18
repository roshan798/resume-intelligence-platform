import { prisma } from "@/lib/prisma";

export class AuthRepository {
    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: {
                email,
            },
        });
    }

    async findById(id: string) {
        return prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    async create(data: { name: string; email: string; password: string }) {
        return prisma.user.create({
            data,
        });
    }

    async updatePassword(userId: string, password: string) {
        return prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password,
            },
        });
    }

    async verifyEmail(userId: string) {
        return prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                emailVerified: new Date(),
            },
        });
    }
}
