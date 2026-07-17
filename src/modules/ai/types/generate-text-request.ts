export interface GenerateTextRequest {
    systemPrompt?: string;

    prompt: string;

    temperature?: number;

    maxTokens?: number;

    jsonMode?: boolean;
}
