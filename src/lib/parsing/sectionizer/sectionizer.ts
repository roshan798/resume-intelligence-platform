import { headings } from "./heading-dictionary";

import { ParsedSections } from "../types";

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
            const normalized = line.toLowerCase();

            if (headings.summary.includes(normalized)) {
                currentSection = "summary";

                continue;
            }

            if (headings.skills.includes(normalized)) {
                currentSection = "skills";

                continue;
            }

            if (headings.experience.includes(normalized)) {
                currentSection = "experience";

                continue;
            }

            if (headings.projects.includes(normalized)) {
                currentSection = "projects";

                continue;
            }

            if (headings.education.includes(normalized)) {
                currentSection = "education";

                continue;
            }

            if (headings.certifications.includes(normalized)) {
                currentSection = "certifications";

                continue;
            }

            if (currentSection === "summary") {
                sections.summary += `${line}\n`;
            } else if (currentSection === "skills") {
                sections.skills += `${line}\n`;
            } else {
                sections[currentSection].push(line);
            }
        }

        return sections;
    }
}
