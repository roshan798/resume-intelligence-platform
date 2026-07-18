"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    registerSchema,
    RegisterSchema,
} from "@/modules/auth/validations/register.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    console.log({ errors });

    async function onSubmit(values: RegisterSchema) {
        setLoading(true);
        setError(null);

        const registerResponse = await fetch("/api/register", {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!registerResponse.ok) {
            const data = await registerResponse.json();
            setError(data.message || "Registration failed.");
            setLoading(false);
            return;
        }

        const signInResponse = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
        });

        if (signInResponse?.error) {
            setError("Login failed after registration.");
            setLoading(false);
            return;
        }

        setLoading(false);
        router.push("/dashboard");
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5">
            {error && (
                <p className="text-xs font-medium text-destructive">{error}</p>
            )}
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Name</label>
                <Input {...register("name")} />
                {errors.name && (
                    <p className="text-xs font-medium text-destructive">
                        {errors.name.message}
                    </p>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                    Email
                </label>
                <Input {...register("email")} />
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

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                    Confirm Password
                </label>
                <div className="relative">
                    <Input
                        {...register("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={
                            showConfirmPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
                        }
                        aria-pressed={showConfirmPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground">
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-xs font-medium text-destructive">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            <div className="space-y-3">
                <Button
                    className="w-full"
                    disabled={loading}
                    type="submit">
                    {loading ? "Registering..." : "Register"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </form>
    );
}
