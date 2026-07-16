import { detectColumns } from "./detect-columns";
import { detectContactInfo } from "./detect-contact-info";
import { detectGarbledText } from "./detect-garbled-text";
import { detectSections } from "./detect-sections";

export interface FormattingHealthResult {
    score: number;
    warnings: string[];
}

export class FormattingHealthService {
    analyze(rawText: string): FormattingHealthResult {
        const warnings = [
            ...detectColumns(rawText),
            ...detectContactInfo(rawText),
            ...detectGarbledText(rawText),
            ...detectSections(rawText),
        ];

        const score = Math.max(0, 100 - warnings.length * 10);

        return {
            score,
            warnings,
        };
    }
}
