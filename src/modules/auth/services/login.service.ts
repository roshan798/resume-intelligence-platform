import { LoginDto } from "../dto/login.dto";
import { AuthRepository } from "../repositories/auth.repository";
import { VerifyPasswordService } from "./verify-password.service";

export class LoginService {
    private repository = new AuthRepository();

    private verifyPassword = new VerifyPasswordService();

    async execute(dto: LoginDto) {
        const user = await this.repository.findByEmail(dto.email);

        if (!user) {
            return null;
        }

        if (!user.password) {
            return null;
        }

        const validPassword = await this.verifyPassword.execute(
            dto.password,
            user.password,
        );

        if (!validPassword) {
            return null;
        }

        return user;
    }
}
