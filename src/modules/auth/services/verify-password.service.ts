import bcrypt from "bcryptjs";

export class VerifyPasswordService {
    async execute(
        password: string,
        hashedPassword: string,
    ) {
        return bcrypt.compare(password, hashedPassword);
    }
}