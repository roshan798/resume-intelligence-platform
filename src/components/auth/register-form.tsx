"use client";

import { useState } from "react";
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

    async function onSubmit(values: RegisterSchema) {
        setLoading(true);
        setError(null);

        const registerResponse = await fetch("/api/register", {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
                "Content-Type": "application/json",
            }
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
                <p className="text-xs font-medium text-destructive">
                    {error}
                </p>
            )}
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                    Email
                </label>
                {/* Fix: Bind the input directly via standard form register methods */}
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
                <Input
                    {...register("password")}
                    type="password"
                />
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
                <Input
                    {...register("confirmPassword")}
                    type="password"
                />
                {errors.confirmPassword && (
                    <p className="text-xs font-medium text-destructive">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            <Button
                className="w-full"
                disabled={loading}>
                Register
            </Button>
        </form>
    );
}
