export interface GenerateTextRequest {
    prompt: string;

    systemPrompt?: string;

    temperature?: number;

    model?: string;
}
