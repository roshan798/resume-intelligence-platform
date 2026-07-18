import { AIProvider } from "@/shared/enums/ai-provider.enum";
import { AIProviderFactory } from "../factory/ai-provider.factory";

export class RewriteBulletsService {
    async execute(input: { jd: string; bullets: string[] }, _userId: string) {
        // const provider = AIProviderFactory.create(AIProviderFactory.getDefaultProvider());
        const provider = AIProviderFactory.create(AIProvider.GROQ);

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

        return provider.generateText({
            prompt,
            temperature: 0.4,
        });
    }
}
