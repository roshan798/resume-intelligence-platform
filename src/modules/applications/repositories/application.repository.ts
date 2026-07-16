import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "@/generated/prisma";

export class ApplicationRepository {
    async create(data: Prisma.ApplicationUncheckedCreateInput) {
        return prisma.application.create({
            data,
        });
    }
}
