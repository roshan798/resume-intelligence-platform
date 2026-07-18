"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Fix 1: Imported the actual 'loginSchema' runtime object along with the type
import {
    loginSchema,
    LoginSchema,
} from "@/modules/auth/validations/login.schema";

export function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Fix 2: Extracted standard React Hook Form parameters to completely bypass the missing wrapper dependencies
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

        const result = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            alert(result.error);
            return;
        }

        router.push("/dashboard");
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

            <Button
                className="w-full"
                disabled={loading}
                type="submit">
                Login
            </Button>
        </form>
    );
}
