import React, { useState } from "react";

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
import { ActionIcon, Text } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";

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
      style={style}
      {...attributes}
      onClick={() => {
        setSelectedData(row);
        setEditData(row);
      }}
    >
      <div
        style={{
          padding: "0 8px",
          cursor: "grab",
          display: "flex",
          alignItems: "center",
        }}
        {...listeners}
      >
        <ActionIcon color="#FFFFF">
          <IconGripVertical size={16} color="black" />
        </ActionIcon>
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
          {row[key]}
        </Text>
      ))}
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
  const [rows, setRows] = useState<Array<Record<string, any>>>(fileData);

  const allKeys = Array.from(
    new Set(fileData.flatMap((item) => Object.keys(item)))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = rows.findIndex(
        (_, index) => index === Number(active.id)
      );
      const newIndex = rows.findIndex((_, index) => index === Number(over.id));
      const newOrder = arrayMove(rows, oldIndex, newIndex);
      setRows(newOrder);
      onRowsReordered(newOrder);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#FFFFFF",
        boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
        borderRadius: "8px",
        padding: "16px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          marginBottom: "16px",
          fontWeight: 700,
          fontSize: "16px",
          color: "#2D2D2D",
          borderTop: "1px solid #EDEDED",
          borderBottom: "1px solid #EDEDED",
        }}
      >
        {allKeys.map((key, index) => (
          <Text
            key={index}
            style={{
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
