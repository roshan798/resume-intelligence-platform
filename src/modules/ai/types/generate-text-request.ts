export interface GenerateTextRequest {
    operation?: string;

    requestId?: string;

    userId?: string;

    model?: string;
    systemPrompt?: string;

    prompt: string;

    temperature?: number;

    maxTokens?: number;

    jsonMode?: boolean;

    timeoutMs?: number;
}
