export interface GenerateTextResponse {
    text: string;

    provider: string;

    model: string;

    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
