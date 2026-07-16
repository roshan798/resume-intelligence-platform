import { envSchema } from "./env.schema";

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);

    throw new Error("Invalid environment configuration");
}

export const Config = parsed.data;
