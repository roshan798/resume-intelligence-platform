import type { GenerateTextResponse } from "./generate-text-response";

export type GenerateTextStreamEvent =
    | { type: "delta"; text: string }
    | { type: "done"; response: Omit<GenerateTextResponse, "text"> };
