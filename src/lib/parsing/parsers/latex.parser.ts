import type { ParsedResume } from "../types";
import type { ResumeParser } from "./parser.interface";

const contentCommands = [
    "textbf",
    "textit",
    "texttt",
    "textrm",
    "textsf",
    "emph",
    "underline",
    "url",
    "name",
    "address",
];

export class LatexResumeParser implements ResumeParser {
    async parse(fileBuffer: Buffer): Promise<ParsedResume> {
        const source = fileBuffer.toString("utf8");
        const cleaned = this.extractReadableText(source);

        return {
            rawText: cleaned,
            sections: {
                summary: "",
                skills: "",
                experience: [],
                projects: [],
                education: [],
                certifications: [],
                others: [],
            },
            sourceFormat: "LATEX",
        };
    }

    private extractReadableText(source: string): string {
        let text = source
            .split(/\r?\n/u)
            .map((line) => this.removeComment(line))
            .filter((line) => {
                const trimmed = line.trim();
                return !/^(?:\\documentclass|\\usepackage|\\newcommand|\\renewcommand|\\geometry)\b/u.test(trimmed);
            })
            .join("\n");

        text = text
            .replace(/\\begin\{rSection\}\{([^}]*)\}/giu, "\n\n$1\n")
            .replace(/\\href\{[^}]*\}\{([^}]*)\}/giu, "$1")
            .replace(/\\(?:section|section\*|subsection|subsection\*)\{([^}]*)\}/giu, "\n\n$1\n")
            .replace(/\\item\b/giu, "\n• ")
            .replace(/\\hfill\b/giu, " — ")
            .replace(/\\(?:vspace|hspace|itemsep)\*?\{?[^}\n]*\}?/giu, " ")
            .replace(/\\begin\{(?:document|itemize|enumerate|multicols)\}(?:\{[^}]*\})?/giu, "\n")
            .replace(/\\end\{(?:document|rSection|itemize|enumerate|multicols)\}/giu, "\n")
            .replace(/\$\\cdot\$/giu, ", ")
            .replace(/\$([^$]*)\$/gu, "$1")
            .replace(/\\&/gu, "&")
            .replace(/\\%/gu, "%")
            .replace(/\\_/gu, "_")
            .replace(/--+/gu, "–");

        for (const command of contentCommands) {
            const expression = new RegExp(`\\\\${command}\\{([^{}]*)\\}`, "giu");
            for (let pass = 0; pass < 4; pass += 1) {
                text = text.replace(expression, "$1");
            }
        }

        return text
            .replace(/\\[a-zA-Z@]+\*?(?:\[[^\]]*\])?/gu, " ")
            .replace(/[{}]/gu, " ")
            .replace(/\\\\(?:\[[^\]]*\])?/gu, "\n")
            .replace(/[ \t]+/gu, " ")
            .replace(/ *\n */gu, "\n")
            .replace(/\n{3,}/gu, "\n\n")
            .trim();
    }

    private removeComment(line: string): string {
        for (let index = 0; index < line.length; index += 1) {
            if (line[index] !== "%") continue;
            let slashCount = 0;
            for (let cursor = index - 1; cursor >= 0 && line[cursor] === "\\"; cursor -= 1) {
                slashCount += 1;
            }
            if (slashCount % 2 === 0) return line.slice(0, index);
        }
        return line;
    }
}
