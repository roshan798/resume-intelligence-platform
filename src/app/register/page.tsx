import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
    return (
        <AuthLayout>
            <AuthCard
                title="Create Account"
                description="Start building smarter resumes">
                <RegisterForm />
            </AuthCard>
        </AuthLayout>
    );
}
