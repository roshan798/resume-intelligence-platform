import { GenerateTextRequest } from "../types/generate-text-request";
import { GenerateTextResponse } from "../types/generate-text-response";

export interface AIProvider {
    generateText(request: GenerateTextRequest): Promise<GenerateTextResponse>;
}
