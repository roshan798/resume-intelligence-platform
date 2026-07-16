export function detectGarbledText(text: string): string[] {
    const warnings: string[] = [];

    const replacementCharacters = (text.match(/�/g) ?? []).length;

    const ratio = replacementCharacters / Math.max(text.length, 1);

    if (ratio > 0.01) {
        warnings.push("Resume contains garbled text or unsupported encoding.");
    }

    return warnings;
}
