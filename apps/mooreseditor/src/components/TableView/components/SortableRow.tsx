import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Table } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import { TableRow } from "./TableRow";
import type { EditingCell } from "../TableView.types";
import type { Column } from "../../../hooks/useJson";
import type { ObjectSchema } from "../../../libs/schema/types";

interface SortableRowProps {
  id: string;
  row: any;
  index: number;
  columns: any[];
  editingCell: EditingCell | null;
  editValue: any;
  setEditValue: (value: any) => void;
  editInputRef: React.RefObject<HTMLDivElement>;
  startEditing: (row: number, column: string) => void;
  saveEdit: () => void;
  cancelEditing: () => void;
  onRowSelect?: (index: number) => void;
  onDataChange?: (newData: any[]) => void;
  removeItem: (index: number) => void;
  arrayData: any[];
  jsonData?: Column[];
  itemSchema?: ObjectSchema;
}

export const SortableRow: React.FC<SortableRowProps> = ({
  id,
  row,
  index,
  columns,
  editingCell,
  editValue,
  setEditValue,
  editInputRef,
  startEditing,
  saveEdit,
  cancelEditing,
  onRowSelect,
  onDataChange,
  removeItem,
  arrayData,
  jsonData,
  itemSchema,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Table.Tr 
      ref={setNodeRef} 
      style={style}
      onClick={() => onRowSelect?.(index)}
    >
      <Table.Td style={{ width: '40px', cursor: 'grab' }} {...attributes} {...listeners}>
        <IconGripVertical size={16} style={{ color: '#868e96' }} />
      </Table.Td>
      <TableRow
        row={row}
        index={index}
        columns={columns}
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        editInputRef={editInputRef}
        startEditing={startEditing}
        saveEdit={saveEdit}
        cancelEditing={cancelEditing}
        onRowSelect={onRowSelect}
        onDataChange={onDataChange}
        removeItem={removeItem}
        arrayData={arrayData}
        jsonData={jsonData}
        itemSchema={itemSchema}
      />
    </Table.Tr>
  );
};