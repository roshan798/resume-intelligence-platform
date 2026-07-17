import { KanbanBoardDto } from "@/modules/applications/dto/kanban-board.dto";

import { KanbanColumn } from "./kanban-column";

interface Props {
    data: KanbanBoardDto;
}

export function KanbanBoard({ data }: Props) {
    return (
        <div className="grid grid-cols-7 gap-4">
            <KanbanColumn
                title="Saved"
                items={data.saved}
            />

            <KanbanColumn
                title="Applied"
                items={data.applied}
            />

            <KanbanColumn
                title="OA"
                items={data.oa}
            />

            <KanbanColumn
                title="Interview"
                items={data.interview}
            />

            <KanbanColumn
                title="Rejected"
                items={data.rejected}
            />

            <KanbanColumn
                title="Offer"
                items={data.offer}
            />

            <KanbanColumn
                title="Closed"
                items={data.closed}
            />
        </div>
    );
}
