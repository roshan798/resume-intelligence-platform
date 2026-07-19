import { AIGatewayService } from "./ai-gateway.service";

export class GenerateSummaryService {
    private readonly gateway = new AIGatewayService();

    async execute(input: { jd: string; resume: string }, _userId: string) {
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

        return this.gateway.generate({
            operation: "generate-summary",
            prompt,
            temperature: 0.5,
            maxTokens: 500,
            timeoutMs: 20_000,
        });
    }
}
