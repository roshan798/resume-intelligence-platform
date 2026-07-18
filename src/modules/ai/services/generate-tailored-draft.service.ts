import { AIProvider } from "@/shared/enums/ai-provider.enum";
import { AIProviderFactory } from "../factory/ai-provider.factory";

export class GenerateTailoredDraftService {
    async execute(input: { resume: string; jd: string }, _userId: string) {
        const provider = AIProviderFactory.create(AIProvider.GROQ);

        const prompt = `
You are an ATS resume optimization assistant.

Job Description:

${input.jd}

Resume:

${input.resume}

Generate an improved ATS optimized version.

Rules:

- Never fabricate experience.
- Never invent companies.
- Keep factual accuracy.
- Improve wording only.
- Increase ATS compatibility.

Return markdown only.
`;

        return provider.generateText({
            prompt,
            temperature: 0.3,
        });
    }
}
