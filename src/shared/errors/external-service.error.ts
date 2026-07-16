import { AppError } from "./app.error";

export class ExternalServiceError extends AppError {
    constructor(service: string, message: string) {
        super("EXTERNAL_SERVICE_ERROR", `${service}: ${message}`, 503);
    }
}
