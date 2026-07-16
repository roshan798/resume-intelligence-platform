export interface GenerateTextRequest {
    prompt: string;
    systemPrompt?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}
