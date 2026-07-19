export interface GenerateTextRequest {
    operation?: string;

    requestId?: string;
    systemPrompt?: string;

    prompt: string;

    temperature?: number;

    maxTokens?: number;

    jsonMode?: boolean;

    timeoutMs?: number;
}
