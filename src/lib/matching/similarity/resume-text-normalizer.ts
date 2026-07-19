const TECHNICAL_TOKEN_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
    [/\bnode\s*\.?\s*js\b/giu, "nodejs"],
    [/\breact\s*\.?\s*js\b/giu, "reactjs"],
    [/\bnext\s*\.?\s*js\b/giu, "nextjs"],
    [/\basp\s*\.\s*net\b/giu, "aspdotnet"],
    [/(^|[^\p{L}\p{N}_])\.\s*net\b/giu, "$1dotnet"],
    [/\bc\s*\+\s*\+/giu, "cplusplus"],
    [/\bc\s*#/giu, "csharp"],
    [/\bci\s*\/\s*cd\b/giu, "cicd"],
];

export function normalizeResumeText(text: string): string {
    let normalized = text.normalize("NFKC").toLowerCase();

    for (const [pattern, replacement] of TECHNICAL_TOKEN_REPLACEMENTS) {
        normalized = normalized.replace(pattern, replacement);
    }

    return normalized
        .replace(/([0-9])\.([0-9])/gu, "$1versiondot$2")
        .replace(/[\p{P}\p{S}]+/gu, " ")
        .replace(/versiondot/gu, ".")
        .replace(/\s+/gu, " ")
        .trim();
}

export function tokenizeNormalizedText(normalizedText: string): string[] {
    return normalizedText ? normalizedText.split(" ") : [];
}

export function createWordBigrams(tokens: string[]): string[] {
    const bigrams: string[] = [];

    for (let index = 0; index < tokens.length - 1; index += 1) {
        bigrams.push(`${tokens[index]} ${tokens[index + 1]}`);
    }

    return bigrams;
}
