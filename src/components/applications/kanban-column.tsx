import { ApplicationCard } from "./application-card";

interface Props {
    title: string;
    items: {
        id: string;
        company: string;
        roleTitle: string;
    }[];
}

export function KanbanColumn({ title, items }: Props) {
    return (
        <div className="min-h-125 rounded-lg border p-4">
            <h2 className="mb-4 font-bold">{title}</h2>

            <div className="space-y-3">
                {items.map((item) => (
                    <ApplicationCard
                        key={item.id}
                        company={item.company}
                        roleTitle={item.roleTitle}
                    />
                ))}
            </div>
        </div>
    );
}
