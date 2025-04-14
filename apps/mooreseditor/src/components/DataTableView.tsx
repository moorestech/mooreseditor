import { useState } from "react";

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
import { Table, ActionIcon } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";

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
    cursor: "default",
    background:
      selectedData === row
        ? "linear-gradient(180deg, #EE722F -2.7%, #FFAD49 100%)"
        : "none",
  };

  return (
    <Table.Tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => {
        setSelectedData(row);
        setEditData(row);
      }}
    >
      <Table.Td
        style={{
          padding: "8px",
          textAlign: "center",
          cursor: "grab",
        }}
        {...listeners}
      >
        <ActionIcon>
          <IconGripVertical size={16} />
        </ActionIcon>
      </Table.Td>
      {allKeys.map((key, colIndex) => (
        <Table.Td
          key={colIndex}
          style={{
            padding: "8px",
            textAlign: "left",
            fontSize: "14px",
            color: "#2D2D2D",
          }}
        >
          {row[key]}
        </Table.Td>
      ))}
    </Table.Tr>
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

  const handleDragEnd = (event: {
    active: { id: number };
    over: { id: number } | null;
  }) => {
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
        width: "100%",
        height: "100vh",
        background: "#FFFFFF",
        boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
        borderRadius: "8px",
        padding: "16px",
        overflowY: "auto",
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rows.map((_, index) => index)}>
          <Table striped highlightOnHover withBorder>
            <thead
              style={{
                borderBottom: "2px solid #E2E2E2",
              }}
            >
              <Table.Tr>
                <Table.Th
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#2D2D2D",
                  }}
                >
                  Drag
                </Table.Th>
                {allKeys.map((key) => (
                  <Table.Th
                    key={key}
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#2D2D2D",
                    }}
                  >
                    {key}
                  </Table.Th>
                ))}
              </Table.Tr>
            </thead>
            <tbody>
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
            </tbody>
          </Table>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default DataTableView;
