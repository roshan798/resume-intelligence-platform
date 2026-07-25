import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { ResumeVersionRepository } from "../repositories/resume-version.repository";

const forbiddenSource = /(?:\\(?:write18|openin|openout|read|immediate|input|include|includegraphics|bibliography|addbibresource)\b|\.\.[\\/]|(?:^|[\s{])[A-Za-z]:[\\/])/imu;
const compileTimeoutMs = 15_000;

export class LatexPreviewError extends Error {}

export class CompileLatexPreviewService {
    constructor(private readonly repository = new ResumeVersionRepository()) {}

    async execute(versionId: string, userId: string): Promise<Buffer | null> {
        const version = await this.repository.findLatexPreviewSource(versionId, userId);
        if (!version) return null;
        if (version.sourceFormat !== "LATEX") return null;
        if (!version.latexSource?.trim()) {
            throw new LatexPreviewError("LaTeX source is unavailable for this version.");
        }
        const input = {
            latexSource: version.latexSource,
            latexStyleSource: version.latexStyleSource,
            latexStyleFilename: version.latexStyleFilename,
        };
        return this.compileInput(input);
    }

    async compileInput(input: {
        latexSource: string;
        latexStyleSource: string | null;
        latexStyleFilename: string | null;
    }): Promise<Buffer> {
        if (process.env.LATEX_COMPILER_URL) return this.compileRemotely(input);
        return this.compileSource(input);
    }

    async compileSource(input: {
        latexSource: string;
        latexStyleSource: string | null;
        latexStyleFilename: string | null;
    }): Promise<Buffer> {
        this.assertSafe(input.latexSource);
        if (input.latexStyleSource) this.assertSafe(input.latexStyleSource);

        const workingDirectory = await mkdtemp(
            join(/*turbopackIgnore: true*/ tmpdir(), "resume-latex-"),
        );
        try {
            await writeFile(
                join(/*turbopackIgnore: true*/ workingDirectory, "resume.tex"),
                input.latexSource,
                "utf8",
            );
            if (input.latexStyleSource && input.latexStyleFilename) {
                const safeFilename = basename(input.latexStyleFilename);
                if (!/^[a-zA-Z0-9._-]+\.(?:cls|sty)$/u.test(safeFilename)) {
                    throw new LatexPreviewError("The LaTeX style filename is invalid.");
                }
                await writeFile(
                    join(/*turbopackIgnore: true*/ workingDirectory, safeFilename),
                    input.latexStyleSource,
                    "utf8",
                );
            }

            await this.compile(workingDirectory);
            return await readFile(
                join(/*turbopackIgnore: true*/ workingDirectory, "resume.pdf"),
            );
        } finally {
            await rm(workingDirectory, { recursive: true, force: true });
        }
    }

    private async compileRemotely(input: {
        latexSource: string;
        latexStyleSource: string | null;
        latexStyleFilename: string | null;
    }): Promise<Buffer> {
        this.assertSafe(input.latexSource);
        if (input.latexStyleSource) this.assertSafe(input.latexStyleSource);
        const baseUrl = process.env.LATEX_COMPILER_URL?.replace(/\/$/u, "");
        const token = process.env.LATEX_COMPILER_TOKEN;
        if (!baseUrl || !token) {
            throw new LatexPreviewError(
                "LATEX_COMPILER_TOKEN is required when LATEX_COMPILER_URL is configured.",
            );
        }
        const response = await fetch(`${baseUrl}/api/internal/latex/compile`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
            signal: AbortSignal.timeout(45_000),
        });
        if (!response.ok) {
            const body = (await response.json().catch(() => null)) as {
                message?: string;
            } | null;
            throw new LatexPreviewError(
                body?.message || `LaTeX compiler returned HTTP ${response.status}.`,
            );
        }
        return Buffer.from(await response.arrayBuffer());
    }

    private assertSafe(source: string) {
        if (source.length > 500_000) throw new LatexPreviewError("LaTeX source is too large to preview.");
        if (forbiddenSource.test(source)) {
            throw new LatexPreviewError("The LaTeX project contains file or shell access commands that cannot be previewed safely.");
        }
    }

    private compile(workingDirectory: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const compiler = spawn(
                "pdflatex",
                [
                    "-no-shell-escape",
                    "-interaction=nonstopmode",
                    "-halt-on-error",
                    "-file-line-error",
                    "-output-directory=.",
                    "resume.tex",
                ],
                {
                    cwd: workingDirectory,
                    windowsHide: true,
                    env: {
                        ...process.env,
                        openin_any: "p",
                        openout_any: "p",
                        shell_escape: "f",
                    },
                },
            );
            let output = "";
            const collect = (chunk: Buffer) => {
                if (output.length < 12_000) output += chunk.toString("utf8");
            };
            compiler.stdout.on("data", collect);
            compiler.stderr.on("data", collect);
            let timedOut = false;
            const timer = setTimeout(() => {
                timedOut = true;
                compiler.kill();
            }, compileTimeoutMs);
            compiler.once("error", (error) => {
                clearTimeout(timer);
                reject(new LatexPreviewError(`LaTeX compiler is unavailable: ${error.message}`));
            });
            compiler.once("close", (code) => {
                clearTimeout(timer);
                if (timedOut) {
                    reject(new LatexPreviewError("LaTeX compilation exceeded the 15-second limit."));
                } else if (code === 0) resolve();
                else reject(new LatexPreviewError(this.compileError(output)));
            });
        });
    }

    private compileError(output: string): string {
        const errorLine = output.split(/\r?\n/u).find((line) => line.startsWith("!"));
        return errorLine
            ? `LaTeX compilation failed: ${errorLine.slice(1).trim()}`
            : "LaTeX compilation failed. Confirm that the matching .cls or .sty file was uploaded.";
    }
}
