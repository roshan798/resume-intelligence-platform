import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthConfig } from "next-auth";

import { authProviders } from "./providers";
import { prisma } from "@/lib/prisma";
export const authOptions: NextAuthConfig = {
    adapter: PrismaAdapter(prisma),

    session: {
        strategy: "jwt",
    },

    providers: authProviders,

    pages: {
        signIn: "/login",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.name = user.name;
                token.email = user.email;
                token.picture = user.image;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.name = (token.name as string) ?? null;
                session.user.email = (token.email as string) ?? "";
                session.user.image = (token.picture as string) ?? null;
            }

            return session;
        },
    },

    secret: process.env.AUTH_SECRET,
};
