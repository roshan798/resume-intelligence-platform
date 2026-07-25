import { redirect } from "next/navigation";
import { CalendarDays, Mail, ShieldCheck, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileForm } from "@/components/auth/profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileService } from "@/modules/auth/services/profile.service";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const profile = await new ProfileService().get(session.user.id);
    if (!profile) redirect("/login");

    const initials = (profile.name || profile.email)
        .split(/\s+/u)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toLocaleUpperCase();
    const providers = profile.accounts.map((account) => account.provider);
    if (profile.hasPassword) providers.push("credentials");

    return (
        <main className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Account
                </p>
                <h1 className="mt-2 text-4xl font-bold">Your profile</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your identity and review how you access the platform.
                </p>
            </div>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 border-b pb-6">
                            <Avatar className="size-16">
                                {profile.image ? <AvatarImage src={profile.image} alt="" /> : null}
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="truncate text-lg font-semibold">{profile.name || "Unnamed user"}</p>
                                <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
                            </div>
                        </div>
                        <ProfileForm initialName={profile.name ?? ""} />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <Detail icon={Mail} label="Email" value={profile.email} />
                            <Detail icon={ShieldCheck} label="Role" value={profile.role} />
                            <Detail
                                icon={UserRound}
                                label="Sign-in methods"
                                value={providers.length ? [...new Set(providers)].join(", ") : "Account"}
                            />
                            <Detail
                                icon={CalendarDays}
                                label="Member since"
                                value={profile.createdAt.toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Session</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Logging out clears this browser&apos;s active session.
                            </p>
                            <LogoutButton />
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
    );
}

function Detail({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Mail;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-1 wrap-break-word font-medium capitalize">{value}</p>
            </div>
        </div>
    );
}
