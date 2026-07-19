import { AppError } from "@/shared/errors/app.error";

export class ResumeUploadError extends AppError {
    constructor(code: string, message: string, statusCode = 400) {
        super(code, message, statusCode);
        this.name = "ResumeUploadError";
    }
}
