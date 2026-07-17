interface Props {
    company: string;
    roleTitle: string;
}

export function ApplicationCard({ company, roleTitle }: Props) {
    return (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="font-semibold">{company}</div>

            <div className="text-sm text-gray-500">{roleTitle}</div>
        </div>
    );
}
