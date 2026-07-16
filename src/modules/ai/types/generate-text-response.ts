export interface GenerateTextResponse {
    text: string;

    provider: string;

    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
    };
}
