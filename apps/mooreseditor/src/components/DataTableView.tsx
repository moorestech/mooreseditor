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
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Text } from "@mantine/core";

import SortableRow from "./SortableRow";

import type { DragEndEvent } from "@dnd-kit/core";

type DataTableViewProps = {
  fileData: Array<Record<string, any>>;
  selectedData: Array<any>;
  setSelectedData: (data: Array<any>) => void;
  setEditData: (data: Record<string, any>) => void;
  onRowsReordered: (rows: Array<Record<string, any>>) => void;
  onRowExpand: (row: Record<string, any>) => void;
};

function DataTableView({
  fileData,
  selectedData,
  setSelectedData,
  setEditData,
  onRowsReordered,
  onRowExpand,
}: DataTableViewProps) {
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [allKeys, setAllKeys] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (fileData.length > 0) {
      setRows(fileData);
      setAllKeys(
        Array.from(new Set(fileData.flatMap((item) => Object.keys(item))))
      );
    }
  }, [fileData]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const oldIndex = active.id as number;
      const newIndex = over.id as number;

      const updatedRows = [...rows];
      const [movedRow] = updatedRows.splice(oldIndex, 1);
      updatedRows.splice(newIndex, 0, movedRow);

      setRows(updatedRows);
      onRowsReordered(updatedRows);
    }
  }

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
              onRowExpand={onRowExpand}
              handleDragEnd={handleDragEnd}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default DataTableView;
