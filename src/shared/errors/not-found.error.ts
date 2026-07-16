import { AppError } from "./app.error";

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super("NOT_FOUND", `${resource} not found`, 404);
    }
}
