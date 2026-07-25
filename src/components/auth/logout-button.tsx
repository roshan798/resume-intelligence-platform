"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
    const [isSigningOut, setIsSigningOut] = useState(false);

    async function logout() {
        setIsSigningOut(true);
        try {
            await signOut({ redirectTo: "/login" });
        } catch {
            setIsSigningOut(false);
        }
    }

    return (
        <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            disabled={isSigningOut}
            onClick={logout}
            aria-label="Log out">
            <LogOut aria-hidden="true" />
            <span className={compact ? "hidden sm:inline" : undefined}>
                {isSigningOut ? "Logging out…" : "Logout"}
            </span>
        </Button>
    );
}
