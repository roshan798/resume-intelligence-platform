import { z } from "zod";

export const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),

    DATABASE_URL: z.string().min(1),

    SUPABASE_URL: z.url(),

    SUPABASE_ANON_KEY: z.string().min(1),

    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_STORAGE_BUCKET: z.string().min(1),

    MAX_UPLOAD_SIZE_MB: z.number().min(1),

    APP_NAME: z.string().min(1),

    APP_ENV: z.string().min(1),
    PORT: z.number().min(1),

    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),

    AI_DEFAULT_PROVIDER: z.enum(["groq", "gemini", "openai", "anthropic"]),

    AI_TIMEOUT_MS: z.number().min(1),

    AI_RETRY_COUNT: z.number().min(1),

    GROQ_API_KEY: z.string().optional(),
    GROQ_MODEL: z.string().optional(),

    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),

    ANTHROPIC_API_KEY: z.string().optional(),
});
