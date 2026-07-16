export interface GenerateTextResponse {
    text: string;

    provider: string;

    model: string;

    inputTokens: number;

    outputTokens: number;
}
