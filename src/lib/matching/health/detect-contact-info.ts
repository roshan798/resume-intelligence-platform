export function detectContactInfo(text: string): string[] {
    const warnings: string[] = [];

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/;

    const phoneRegex = /(\+?\d{1,3}[- ]?)?\d{10}/;

    const firstChunk = text.split("\n").slice(0, 20).join(" ");

    if (!emailRegex.test(firstChunk)) {
        warnings.push("Email address not detected near top of resume.");
    }

    if (!phoneRegex.test(firstChunk)) {
        warnings.push("Phone number not detected near top of resume.");
    }

    return warnings;
}
