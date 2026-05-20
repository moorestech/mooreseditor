import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";

import type { DragEndEvent } from "@dnd-kit/core";

interface DraggableActionIconProps {
  rowIndex: number;
  handleDragEnd: (event: DragEndEvent) => void;
  isSelected: boolean;
}

function DraggableActionIcon({
  rowIndex,
  handleDragEnd,
  isSelected,
}: DraggableActionIconProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: rowIndex,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ActionIcon
        style={{
          background: isSelected ? "none" : "#FFFFFF",
          color: "#000000",
        }}
        {...attributes}
        {...listeners}
        onMouseUp={() => {
          handleDragEnd({
            active: { id: rowIndex },
            over: { id: rowIndex },
          } as DragEndEvent);
        }}
      >
        <IconGripVertical size={20} />
      </ActionIcon>
    </div>
  );
}

export default DraggableActionIcon;
