import { AIGatewayService } from "./ai-gateway.service";

export class RewriteBulletsService {
    private readonly gateway = new AIGatewayService();

    async execute(input: { jd: string; bullets: string[] }, _userId: string) {
        const prompt = `
Job Description:

${input.jd}

Rewrite these resume bullets to better align with the JD.

Bullets:
${input.bullets.join("\n")}

Rules:
- Keep truthful.
- Keep metrics.
- ATS optimized.
- Return JSON only.

{
  "rewritten":[
    {
      "original":"",
      "updated":""
    }
  ]
}
`;

        return this.gateway.generate({
            operation: "rewrite-bullets",
            prompt,
            temperature: 0.4,
            maxTokens: 1200,
            jsonMode: true,
            timeoutMs: 25_000,
        });
    }
}
