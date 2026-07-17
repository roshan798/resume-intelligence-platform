import { AIProvider } from "@/shared/enums/ai-provider.enum";
import { AIProviderFactory } from "../factory/ai-provider.factory";

export class GenerateMissingKeywordsService {
    async execute(input: { resumeText: string; missingKeywords: string[] }) {
        const provider = AIProviderFactory.create(AIProvider.GROQ);

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

        return provider.generateText({
            prompt,
            temperature: 0.2,
        });
    }
}
