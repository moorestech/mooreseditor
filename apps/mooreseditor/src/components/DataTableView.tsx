import { useState, useEffect } from "react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox, ActionIcon, Text } from "@mantine/core";
import {
  IconChevronRight,
  IconGripVertical,
  IconStack2,
} from "@tabler/icons-react";

import type { DragEndEvent } from "@dnd-kit/core";

interface DataTableViewProps {
  fileData: Array<Record<string, any>>;
  selectedData: Record<string, any> | null;
  setSelectedData: (data: Record<string, any>) => void;
  setEditData: (data: Record<string, any>) => void;
  onRowsReordered: (newOrder: Array<Record<string, any>>) => void;
}

interface SortableRowProps {
  row: Record<string, any>;
  rowIndex: number;
  allKeys: string[];
  selectedData: Record<string, any> | null;
  setSelectedData: (data: Record<string, any>) => void;
  setEditData: (data: Record<string, any>) => void;
}
function SortableRow({
  row,
  rowIndex,
  allKeys,
  selectedData,
  setSelectedData,
  setEditData,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: rowIndex,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    width: "100%",
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
    justifyContent: "space-between",
    cursor: "pointer",
    boxShadow:
      selectedData === row ? "0px 0px 4px rgba(0, 0, 0, 0.25)" : "none",
    whiteSpace: "nowrap",
  };

  return (
    <div
      ref={setNodeRef}
      style={style as React.CSSProperties}
      {...attributes}
      {...listeners}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditData(row);
      }}
    >
      <div
        style={{
          padding: "0 8px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <ActionIcon
          style={{
            background: selectedData === row ? "none" : "#FFFFFF",
            color: "#000000",
            cursor: "grab",
          }}
        >
          <IconGripVertical size={16} />
        </ActionIcon>
        <ActionIcon
          style={{
            backgroundColor: "transparent",
            color: selectedData === row ? "#FFFFFF" : "#2D2D2D",
            marginRight: "8px",
          }}
        >
          <IconStack2 size={16} />
        </ActionIcon>
        <Checkbox
          style={{
            marginLeft: "8px",
          }}
        />
      </div>
      {allKeys.map((key, colIndex) => (
        <Text
          key={colIndex}
          style={{
            padding: "0 8px",
            fontSize: "14px",
            color: selectedData === row ? "#FFFFFF" : "#2D2D2D",
            flex: 1,
            textAlign: "left",
          }}
        >
          {typeof row[key] === "object"
            ? JSON.stringify(row[key])
            : row[key] || "-"}
        </Text>
      ))}
      <ActionIcon
        style={{
          backgroundColor: "transparent",
          color: selectedData === row ? "#FFFFFF" : "#2D2D2D",
          marginRight: "8px",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setEditData(row);
        }}
      >
        <IconChevronRight size={16} />
      </ActionIcon>
    </div>
  );
}

function DataTableView({
  fileData,
  selectedData,
  setSelectedData,
  setEditData,
  onRowsReordered,
}: DataTableViewProps) {
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [allKeys, setAllKeys] = useState<string[]>([]);

  useEffect(() => {
    if (fileData.length > 0) {
      setRows(fileData);
      setAllKeys(
        Array.from(new Set(fileData.flatMap((item) => Object.keys(item))))
      );
    }
  }, [fileData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = rows.findIndex((_, index) => index === active.id);
      const newIndex = rows.findIndex((_, index) => index === over.id);
      const newOrder = arrayMove(rows, oldIndex, newIndex);
      setRows(newOrder);
      onRowsReordered(newOrder);
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        width: "100%",
        height: "100vh",
        background: "#FFFFFF",
        overflowY: "auto",
        marginTop: "16px",
        borderTop: "1px solid #E2E2E2",
      }}
    >
      <div
        style={{
          display: "flex",
          marginBottom: "16px",
          fontWeight: 700,
          fontSize: "16px",
          color: "#2D2D2D",
        }}
      >
        {allKeys.map((key, index) => (
          <Text
            key={index}
            style={{
              fontWeight: 700,
              padding: "0 8px",
              flex: 1,
              textAlign: "left",
            }}
          >
            {key}
          </Text>
        ))}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rows.map((_, index) => index)}>
          {rows.map((row, rowIndex) => (
            <SortableRow
              key={rowIndex}
              row={row}
              rowIndex={rowIndex}
              allKeys={allKeys}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
              setEditData={setEditData}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default DataTableView;
