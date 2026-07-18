"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    loginSchema,
    LoginSchema,
} from "@/modules/auth/validations/login.schema";

export function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginSchema) {
        setLoading(true);

        try {
            // In Auth.js v5, standard redirect happens automatically.
            // If the credentials fail, NextAuth will throw a redirect error or route to the error page.
            await signIn("credentials", {
                email: values.email,
                password: values.password,
                callbackUrl: "/dashboard",
            });
        } catch (err) {
            // This catches any local network issues before the redirect lifecycle triggers
            console.error("Authentication submission failed", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                    Email
                </label>
                <Input
                    {...register("email")}
                    placeholder="john@example.com"
                    type="email"
                />
                {errors.email && (
                    <p className="text-xs font-medium text-destructive">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                    Password
                </label>
                <div className="relative">
                    <Input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground">
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-xs font-medium text-destructive">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <div className="space-y-3">
                <Button
                    className="w-full"
                    disabled={loading}
                    type="submit">
                    {loading ? "Logging in..." : "Login"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </form>
    );
}
