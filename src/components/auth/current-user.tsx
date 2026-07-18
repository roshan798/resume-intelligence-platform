import { auth } from "@/auth";

export async function CurrentUser() {
    const session = await auth();

    return (
        <div className="text-sm">
            <p>{session?.user?.email}</p>
        </div>
    );
}
