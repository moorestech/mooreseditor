import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, Checkbox, Text } from "@mantine/core";
import { IconChevronRight, IconStack2 } from "@tabler/icons-react";

import DraggableActionIcon from "./DraggableActionIcon";

import type { DragEndEvent } from "@dnd-kit/core";

interface SortableRowProps {
  row: Record<string, any>;
  rowIndex: number;
  allKeys: string[];
  selectedData: any;
  setSelectedData: (data: any) => void;
  setEditData: (data: any) => void;
  onRowExpand?: (row: any) => void;
}

function SortableRow({
  row,
  rowIndex,
  allKeys,
  selectedData,
  setSelectedData,
  setEditData,
  onRowExpand,
  handleDragEnd,
}: SortableRowProps & { handleDragEnd: (event: DragEndEvent) => void }) {
  const {
    attributes,
    listeners: _listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: rowIndex,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    width: "100%", // ボタンの幅を100%に設定
    height: "48px",
    marginBottom: "8px",
    background:
      selectedData === row
        ? "linear-gradient(90deg, #EE722F -2.7%, #FFAD49 100%)"
        : "#FFFFFF",
    border: "1px solid #EE722F",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    whiteSpace: "nowrap",
    cursor: "pointer",
    boxSizing: "border-box", // ボーダーを含めた幅を調整
    boxShadow:
      selectedData === row
        ? "0px 0px 4px rgba(0, 0, 0, 0.25)"
        : "0px 0px 4px none",
  };

  return (
    <button
      ref={setNodeRef}
      style={style as React.CSSProperties}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedData(row);
        setEditData(row);
      }}
    >
      <div
        style={{
          padding: "0 8px",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        <DraggableActionIcon
          rowIndex={rowIndex}
          handleDragEnd={handleDragEnd}
          isSelected={selectedData === row}
        />
        <ActionIcon
          style={{
            margin: "8px",
            backgroundColor: "transparent",
          }}
        >
          <Checkbox />
        </ActionIcon>
        <ActionIcon
          style={{
            backgroundColor: "transparent",
            color: selectedData === row ? "#FFFFFF" : "#2D2D2D",
            marginRight: "8px",
          }}
        >
          <IconStack2 size={20} />
        </ActionIcon>
        {allKeys.map((key, colIndex) => (
          <Text
            key={colIndex}
            style={{
              padding: "0 8px",
              fontSize: "14px",
              color: selectedData === row ? "#FFFFFF" : "#2D2D2D",
              flexShrink: 0,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {typeof row[key] === "object" && row[key] !== null ? (
              <>{key}</>
            ) : (
              row[key] || "-"
            )}
          </Text>
        ))}

        <ActionIcon
          style={{
            backgroundColor: "transparent",
            color: selectedData === row ? "#FFFFFF" : "#2D2D2D",
            marginRight: "8px",
          }}
          onClick={() => onRowExpand?.(row)}
        >
          <IconChevronRight size={20} />
        </ActionIcon>
      </div>
    </button>
  );
}

export default SortableRow;
