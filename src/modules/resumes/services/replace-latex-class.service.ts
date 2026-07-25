import { prisma } from "@/lib/prisma";
import { CompileLatexPreviewService } from "./compile-latex-preview.service";

export class ReplaceLatexClassService {
    private readonly compiler = new CompileLatexPreviewService();

    async execute(input: {
        versionId: string;
        userId: string;
        filename: string;
        source: string;
    }) {
        const version = await prisma.resumeVersion.findFirst({
            where: {
                id: input.versionId,
                resume: { userId: input.userId },
            },
            select: {
                id: true,
                status: true,
                sourceFormat: true,
                latexSource: true,
            },
        });
        if (!version) return null;
        if (version.sourceFormat !== "LATEX" || !version.latexSource?.trim()) {
            throw new Error("This resume version does not contain LaTeX source.");
        }
        if (version.status === "ARCHIVED") {
            throw new Error("An archived resume version cannot be modified.");
        }

        await this.compiler.compileInput({
            latexSource: version.latexSource,
            latexStyleSource: input.source,
            latexStyleFilename: input.filename,
        });

        return prisma.resumeVersion.update({
            where: { id: version.id },
            data: {
                latexStyleSource: input.source,
                latexStyleFilename: input.filename,
            },
            select: {
                id: true,
                latexStyleFilename: true,
                updatedAt: true,
            },
        });
    }
}
