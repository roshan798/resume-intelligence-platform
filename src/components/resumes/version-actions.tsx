"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface Props {
    versionId: string;
}

export function VersionActions({ versionId }: Props) {
    const router = useRouter();

    async function call(endpoint: string) {
        await fetch(endpoint, {
            method: "POST",
        });

        router.refresh();
    }

    return (
        <div className="flex flex-wrap gap-3">
            <Button
                variant="outline"
                onClick={() => call(`/api/resumes/versions/${versionId}/fork`)}>
                Fork Version
            </Button>

            <Button
                onClick={() =>
                    call(`/api/resumes/versions/${versionId}/finalize`)
                }>
                Finalize
            </Button>

            <Button
                variant="destructive"
                onClick={() =>
                    call(`/api/resumes/versions/${versionId}/archive`)
                }>
                Archive
            </Button>
        </div>
    );
}
