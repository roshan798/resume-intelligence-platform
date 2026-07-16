export function detectColumns(text: string): string[] {
    const warnings: string[] = [];

    const lines = text.split("\n");

    const suspiciousLines = lines.filter(
        (line) => line.length > 120 && /\s{8,}/.test(line),
    );

    if (suspiciousLines.length > 10) {
        warnings.push(
            "Possible multi-column layout detected. Some ATS systems may parse incorrectly.",
        );
    }

    return warnings;
}
