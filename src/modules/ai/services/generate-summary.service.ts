import { AIProvider } from "@/shared/enums/ai-provider.enum";
import { AIProviderFactory } from "../factory/ai-provider.factory";

export class GenerateSummaryService {
    async execute(input: { jd: string; resume: string }) {
        const provider = AIProviderFactory.create(AIProvider.GROQ);

        const prompt = `
Generate an ATS optimized professional summary.

Job Description:
${input.jd}

Resume:
${input.resume}

Requirements:
- 4-5 lines
- ATS optimized
- Include critical technologies
- Human readable
`;

        return provider.generateText({
            prompt,
            temperature: 0.5,
        });
    }
}
