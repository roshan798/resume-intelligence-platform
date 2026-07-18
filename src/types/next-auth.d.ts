import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: string;
        name: string | null;
        image: string | null;
        email: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        name: string | null;
        email: string;
        picture: string | null;
    }
}
