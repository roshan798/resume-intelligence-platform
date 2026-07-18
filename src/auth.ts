// src/auth.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// Force the handlers to use standard server-safe parameters
export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authOptions,
});
