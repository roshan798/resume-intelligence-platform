import { AIGatewayService } from "./ai-gateway.service";

export class GenerateTailoredDraftService {
    private readonly gateway = new AIGatewayService();

    async execute(input: { resume: string; jd: string }, userId: string) {
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

        return this.gateway.generate({
            operation: "tailored-draft",
            userId,
            prompt,
            temperature: 0.3,
            maxTokens: 2500,
            timeoutMs: 40_000,
        });
    }
}
