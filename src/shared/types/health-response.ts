export interface HealthResponse {
    status: "healthy" | "unhealthy";

    database: boolean;

    storage: boolean;

    aiProviders: Record<string, boolean>;
}
