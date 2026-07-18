import { Prisma,BackgroundJobStatus } from "@prisma/client";
import { CreateJobDto } from "../dto/create-job.dto";
import { UpdateJobDto } from "../dto/update-job.dto";
import { prisma } from "@/lib/prisma";

export class BackgroundJobRepository {
    create(dto: CreateJobDto) {
        return prisma.backgroundJob.create({
            data: {
                ...dto,
                status: dto.status ?? "QUEUED",
            },
        });
    }

    findById(id: string) {
        return prisma.backgroundJob.findUnique({
            where: {
                id,
            },
        });
    }

    findByQueueId(queueJobId: string) {
        return prisma.backgroundJob.findFirst({
            where: {
                queueJobId,
            },
        });
    }

    update(id: string, dto: UpdateJobDto) {
        return prisma.backgroundJob.update({
            where: {
                id,
            },
            data: dto as Prisma.BackgroundJobUpdateInput,
        });
    }

    updateProgress(id: string, progress: number) {
        return prisma.backgroundJob.update({
            where: {
                id,
            },
            data: {
                progress,
            },
        });
    }

    updateStatus(id: string, status: BackgroundJobStatus) {
        return prisma.backgroundJob.update({
            where: {
                id,
            },
            data: {
                status,
            },
        });
    }

    complete(id: string, result?: object) {
        return prisma.backgroundJob.update({
            where: {
                id,
            },
            data: {
                status: "COMPLETED",
                progress: 100,
                completedAt: new Date(),
                result: result as Prisma.InputJsonValue | undefined,
            },
        });
    }

    fail(id: string, error: string) {
        return prisma.backgroundJob.update({
            where: {
                id,
            },
            data: {
                status: "FAILED",
                error,
                completedAt: new Date(),
            },
        });
    }
}
