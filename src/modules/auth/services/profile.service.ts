import { prisma } from "@/lib/prisma";

import type { UpdateProfileInput } from "../validations/update-profile.schema";

export class ProfileService {
    async get(userId: string) {
        const profile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                image: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                accounts: {
                    select: { provider: true },
                    orderBy: { provider: "asc" },
                },
            },
        });
        if (!profile) return null;

        const { password, ...publicProfile } = profile;
        return { ...publicProfile, hasPassword: Boolean(password) };
    }

    async update(userId: string, input: UpdateProfileInput) {
        return prisma.user.update({
            where: { id: userId },
            data: { name: input.name },
            select: {
                id: true,
                name: true,
                email: true,
                updatedAt: true,
            },
        });
    }
}
