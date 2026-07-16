interface Props {
    version: {
        id: string;
        versionNumber: number;
        status: string;
        createdAt: string;
    };
}

export function VersionCard({ version }: Props) {
    return (
        <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                    Version {version.versionNumber}
                </h3>

                <span>{version.status}</span>
            </div>

            <p className="text-sm text-gray-500">
                Created: {new Date(version.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
}
