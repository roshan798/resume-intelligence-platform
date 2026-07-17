import Groq from "groq-sdk";

import { AIProvider } from "./ai-provider";
import { GenerateTextRequest } from "../types/generate-text-request";
import { GenerateTextResponse } from "../types/generate-text-response";

import { AIConfig } from "@/lib/config/ai.config";

export class GroqProvider implements AIProvider {
    private client = new Groq({
        apiKey: AIConfig.groq.apiKey,
    });

    async generateText(
        request: GenerateTextRequest,
    ): Promise<GenerateTextResponse> {
        const response = await this.client.chat.completions.create({
            model: AIConfig.groq.model!,

            temperature: request.temperature ?? 0.2,

            max_completion_tokens: request.maxTokens ?? 4096,

            messages: [
                ...(request.systemPrompt
                    ? [
                          {
                              role: "system" as const,
                              content: request.systemPrompt,
                          },
                      ]
                    : []),

                {
                    role: "user",
                    content: request.prompt,
                },
            ],
        });

        return {
            text: response.choices[0]?.message.content ?? "",
            // TODO use enums for provider and model
            provider: "GROQ",
            model: AIConfig.groq.model!,
            usage: {
                promptTokens: response.usage?.prompt_tokens ?? 0,
                completionTokens: response.usage?.completion_tokens ?? 0,
                totalTokens: response.usage?.total_tokens ?? 0,
            },
        };
    }
}
