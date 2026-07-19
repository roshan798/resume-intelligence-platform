import { AIGatewayService } from "./ai-gateway.service";

export class GenerateMissingKeywordsService {
    private readonly gateway = new AIGatewayService();

    async execute(
        input: { resumeText: string; missingKeywords: string[] },
        _userId: string,
    ) {
        const prompt = `
Resume:

${input.resumeText}

Missing Keywords:
${input.missingKeywords.join(", ")}

Explain where each keyword should be added naturally.
Return JSON only.

{
  "recommendations":[
    {
      "keyword":"Kafka",
      "reason":"Mentioned in JD but absent.",
      "suggestion":"Add Kafka usage in backend project bullet."
    }
  ]
}
`;

        return this.gateway.generate({
            operation: "missing-keywords",
            prompt,
            temperature: 0.2,
            maxTokens: 900,
            jsonMode: true,
            timeoutMs: 20_000,
        });
    }
}
