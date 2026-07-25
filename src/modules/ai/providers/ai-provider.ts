import { GenerateTextRequest } from "../types/generate-text-request";
import { GenerateTextResponse } from "../types/generate-text-response";
import type { GenerateTextStreamEvent } from "../types/generate-text-stream-event";

export interface AIProvider {
    generateText(request: GenerateTextRequest): Promise<GenerateTextResponse>;
    generateTextStream(request: GenerateTextRequest): AsyncGenerator<GenerateTextStreamEvent>;
}
