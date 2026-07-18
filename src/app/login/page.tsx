import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <AuthLayout>
            <AuthCard
                title="Welcome Back"
                description="Login to Resume Intelligence Platform">
                <LoginForm />
            </AuthCard>
        </AuthLayout>
    );
}
