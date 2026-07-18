import { RegisterDto } from "../dto/register.dto";
import { AuthRepository } from "../repositories/auth.repository";
import { HashPasswordService } from "./hash-password.service";

export class RegisterService {
    private repository = new AuthRepository();

    private hashPassword = new HashPasswordService();

    async execute(dto: RegisterDto) {
        const existingUser = await this.repository.findByEmail(dto.email);

        if (existingUser) {
            throw new Error("Email already exists");
        }

        const hashedPassword = await this.hashPassword.execute(dto.password);

        return this.repository.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
        });
    }
}
