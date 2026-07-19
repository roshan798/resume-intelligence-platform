import { ApplicationRepository } from "../repositories/application.repository";
import { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApplicationStatusHistoryRepository } from "../repositories/application-status-history.repository";
export class ApplicationService {
    private repository = new ApplicationRepository();
    private historyRepository = new ApplicationStatusHistoryRepository();

    async create(data: Prisma.ApplicationUncheckedCreateInput) {
        return this.repository.create(data);
    }

    async createManual(data: {
        userId: string;
        company: string;
        roleTitle: string;
        resumeVersionId: string;
        jdAnalysisId?: string | null;
    }) {
        const [version, analysis] = await Promise.all([
            prisma.resumeVersion.findFirst({
                where: { id: data.resumeVersionId, resume: { userId: data.userId } },
                select: { id: true },
            }),
            data.jdAnalysisId
                ? prisma.jDAnalysis.findFirst({ where: { id: data.jdAnalysisId, userId: data.userId }, select: { id: true } })
                : Promise.resolve(null),
        ]);
        if (!version || (data.jdAnalysisId && !analysis)) return null;
        return this.repository.create({
            ...data,
            jdAnalysisId: data.jdAnalysisId ?? null,
            status: ApplicationStatus.SAVED,
        });
    }

    async createFromMatch(matchResultId: string, userId: string) {
        const match = await prisma.matchResult.findFirst({
            where: { id: matchResultId, jdAnalysis: { userId } },
            include: {
                jdAnalysis: { include: { jobDescription: true } },
            },
        });
        if (!match) return null;

        const existing = await prisma.application.findFirst({
            where: {
                userId,
                jdAnalysisId: match.jdAnalysisId,
                resumeVersionId: match.resumeVersionId,
            },
        });
        if (existing) return existing;

        return this.repository.create({
            userId,
            jdAnalysisId: match.jdAnalysisId,
            resumeVersionId: match.resumeVersionId,
            company:
                match.jdAnalysis.company ||
                match.jdAnalysis.jobDescription?.company ||
                "Unknown company",
            roleTitle:
                match.jdAnalysis.roleTitle ||
                match.jdAnalysis.jobDescription?.roleTitle ||
                "Untitled role",
            location: match.jdAnalysis.jobDescription?.location,
            applicationUrl: match.jdAnalysis.jobDescription?.sourceUrl,
            status: ApplicationStatus.SAVED,
        });
    }

    async update(
        id: string,
        userId: string,
        data: Prisma.ApplicationUncheckedUpdateInput,
    ) {
        const previous = await this.repository.findByIdAndUser(id, userId);
        if (!previous) return null;
        const updated = await this.repository.update(id, userId, data);
        if (
            updated &&
            typeof data.status === "string" &&
            data.status !== previous.status
        ) {
            await this.historyRepository.create(
                id,
                data.status as ApplicationStatus,
            );
        }
        return updated;
    }

    async delete(id: string, userId: string) {
        return this.repository.delete(id, userId);
    }
}
