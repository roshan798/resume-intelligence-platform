import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { LoginService } from "@/modules/auth/services/login.service";
export const authProviders = [
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
        name: "credentials",

        credentials: {
            email: {},
            password: {},
        },

        async authorize(credentials) {
            const loginService = new LoginService();

            const user = await loginService.execute({
                email: String(credentials.email),
                password: String(credentials.password),
            });

            return user;
        },
    }),
];
