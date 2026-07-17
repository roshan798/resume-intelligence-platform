import { Config as env } from "./index";

export const AIConfig = {
    groq: {
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL,
    },

    gemini: {
        apiKey: env.GEMINI_API_KEY,
        model: env.GEMINI_MODEL,
    },
};
