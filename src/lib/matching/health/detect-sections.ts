const requiredSections = ["experience", "skills", "projects", "education"];

export function detectSections(text: string): string[] {
    const warnings: string[] = [];

    const normalized = text.toLowerCase();

    for (const section of requiredSections) {
        if (!normalized.includes(section)) {
            warnings.push(`${section} section not detected.`);
        }
    }

    return warnings;
}
