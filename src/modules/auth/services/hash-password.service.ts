import bcrypt from "bcryptjs";

export class HashPasswordService {
    async execute(password: string) {
        return bcrypt.hash(password, 12);
    }
}
