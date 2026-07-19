export type JDSectionName =
    | "requirements"
    | "responsibilities"
    | "preferred"
    | "general";

export type JDSections = Record<JDSectionName, string>;

const headingPatterns: Array<{
    section: Exclude<JDSectionName, "general">;
    pattern: RegExp;
}> = [
    {
        section: "requirements",
        pattern: /^(?:requirements?|qualifications?|must[- ]haves?|required skills?|what you bring)$/iu,
    },
    {
        section: "responsibilities",
        pattern: /^(?:responsibilities|what you(?:'|’)ll do|duties|your role)$/iu,
    },
    {
        section: "preferred",
        pattern: /^(?:preferred(?: qualifications?| skills?)?|nice[- ]to[- ]haves?|good[- ]to[- ]haves?|bonus(?: skills?)?)$/iu,
    },
];

export class JDSectionizer {
    extract(text: string): JDSections {
        const lines: Record<JDSectionName, string[]> = {
            requirements: [],
            responsibilities: [],
            preferred: [],
            general: [],
        };
        let currentSection: JDSectionName = "general";

        for (const rawLine of text.split(/\r?\n/u)) {
            const trimmed = rawLine.trim();
            const heading = trimmed.replace(/[:\s]+$/u, "");
            const match = headingPatterns.find(({ pattern }) => pattern.test(heading));

            if (match) {
                currentSection = match.section;
                continue;
            }

            lines[currentSection].push(rawLine);
        }

        return {
            requirements: this.clean(lines.requirements),
            responsibilities: this.clean(lines.responsibilities),
            preferred: this.clean(lines.preferred),
            general: this.clean(lines.general),
        };
    }

    private clean(lines: string[]): string {
        return lines.join("\n").trim();
    }
}
