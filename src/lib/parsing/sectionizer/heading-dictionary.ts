import type { ParsedSections } from "../types";

export type CanonicalSection = keyof ParsedSections;

export const headings: Record<Exclude<CanonicalSection, "others">, readonly string[]> = {
    summary: ["summary", "professional summary", "career summary", "profile", "professional profile", "objective", "career objective", "about me"],
    skills: ["skills", "technical skills", "core skills", "key skills", "tech stack", "technology stack", "technologies", "tools and technologies", "technical proficiencies", "core competencies", "areas of expertise"],
    experience: ["experience", "professional experience", "work experience", "relevant experience", "industry experience", "employment", "employment history", "work history", "career history", "professional background"],
    projects: ["projects", "personal projects", "professional projects", "selected projects", "key projects", "academic projects", "project experience"],
    education: ["education", "educational background", "academic background", "academic qualifications", "qualifications"],
    certifications: ["certifications", "certificates", "licenses", "licenses and certifications", "certifications and licenses", "achievements and certifications", "awards and certifications", "courses and certifications"],
};

const headingLookup = new Map<string, Exclude<CanonicalSection, "others">>(
    Object.entries(headings).flatMap(([section, aliases]) =>
        aliases.map((alias) => [alias, section as Exclude<CanonicalSection, "others">]),
    ),
);

export function identifyHeading(line: string): Exclude<CanonicalSection, "others"> | null {
    const normalized = line
        .normalize("NFKC")
        .toLocaleLowerCase()
        .replace(/&/gu, " and ")
        .replace(/^[\s•|—–-]+|[\s:|—–-]+$/gu, "")
        .replace(/\s+/gu, " ")
        .trim();

    return headingLookup.get(normalized) ?? null;
}
