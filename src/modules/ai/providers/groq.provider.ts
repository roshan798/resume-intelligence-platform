import Groq from "groq-sdk";

import { AIProvider } from "./ai-provider";
import { GenerateTextRequest } from "../types/generate-text-request";
import { GenerateTextResponse } from "../types/generate-text-response";
import type { GenerateTextStreamEvent } from "../types/generate-text-stream-event";

import { AIConfig } from "@/lib/config/ai.config";

export class GroqProvider implements AIProvider {
    private client: Groq;

    constructor() {
        if (!AIConfig.groq.apiKey || !AIConfig.groq.model) {
            throw new Error("Groq generation is not configured.");
        }
        this.client = new Groq({ apiKey: AIConfig.groq.apiKey });
    }

    async generateText(
        request: GenerateTextRequest,
    ): Promise<GenerateTextResponse> {
        const model = request.model ?? AIConfig.groq.model!;
        const response = await this.client.chat.completions.create({
            model,

            temperature: request.temperature ?? 0.2,

            max_completion_tokens: request.maxTokens ?? 4096,
            response_format: request.jsonMode ? { type: "json_object" } : undefined,

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
            provider: "GROQ",
            model,
            usage: {
                promptTokens: response.usage?.prompt_tokens ?? 0,
                completionTokens: response.usage?.completion_tokens ?? 0,
                totalTokens: response.usage?.total_tokens ?? 0,
            },
        };
    }

    async *generateTextStream(
        request: GenerateTextRequest,
    ): AsyncGenerator<GenerateTextStreamEvent> {
        const model = request.model ?? AIConfig.groq.model!;
        const stream = await this.client.chat.completions.create({
            model,
            temperature: request.temperature ?? 0.2,
            max_completion_tokens: request.maxTokens ?? 4096,
            stream: true,
            messages: [
                ...(request.systemPrompt
                    ? [{ role: "system" as const, content: request.systemPrompt }]
                    : []),
                { role: "user" as const, content: request.prompt },
            ],
        });
        let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
        for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta.content;
            if (text) yield { type: "delta", text };
            if (chunk.x_groq?.usage) {
                usage = {
                    promptTokens: chunk.x_groq.usage.prompt_tokens ?? 0,
                    completionTokens: chunk.x_groq.usage.completion_tokens ?? 0,
                    totalTokens: chunk.x_groq.usage.total_tokens ?? 0,
                };
            }
        }
        yield { type: "done", response: { provider: "GROQ", model, usage } };
    }
}
