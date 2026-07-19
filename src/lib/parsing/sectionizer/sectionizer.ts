import type { ParsedSections } from "../types";
import { identifyHeading } from "./heading-dictionary";

export class ResumeSectionizer {
    extract(text: string): ParsedSections {
        const lines = text
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        const sections: ParsedSections = {
            summary: "",
            skills: "",
            experience: [],
            projects: [],
            education: [],
            certifications: [],
            others: [],
        };
        let currentSection: keyof ParsedSections = "others";

        for (const line of lines) {
            const heading = identifyHeading(line);
            if (heading) {
                currentSection = heading;
                continue;
            }

            if (currentSection === "summary" || currentSection === "skills") {
                sections[currentSection] += `${line}\n`;
            } else {
                sections[currentSection].push(line);
            }
        }

        sections.summary = sections.summary.trim();
        sections.skills = sections.skills.trim();
        return sections;
    }
}
