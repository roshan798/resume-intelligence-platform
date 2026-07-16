interface Props {
    versions: {
        id: string;
        versionNumber: number;
        status: string;
        parentVersionId?: string | null;
    }[];
}

export function VersionLineageTree({ versions }: Props) {
    return (
        <div className="space-y-2">
            {versions.map((version) => (
                <div
                    key={version.id}
                    className="rounded border p-4">
                    <div>Version {version.versionNumber}</div>

                    <div>{version.status}</div>

                    {version.parentVersionId && (
                        <div className="text-sm text-gray-500">
                            Forked from: {version.parentVersionId}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
