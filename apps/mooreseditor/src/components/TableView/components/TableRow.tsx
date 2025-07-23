import React from "react";
import { Table, Button, Group, ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { ForeignKeyDisplayCell } from "../cells/ForeignKeyDisplayCell";
import { EditableCell } from "../cells/EditableCell";
import type { EditingCell } from "../TableView.types";
import type { Column } from "../../../hooks/useJson";

interface TableRowProps {
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
}

export const TableRow: React.FC<TableRowProps> = ({
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
}) => {
  return (
    <Table.Tr
      onClick={() => onRowSelect?.(index)}
      style={{ cursor: onRowSelect ? 'pointer' : 'default' }}
    >
      <Table.Td>{index}</Table.Td>
      {columns.map(column => {
        const value = row[column.key];
        const columnSchema = column as any;
        const isEditing = editingCell?.row === index && editingCell?.column === column.key;

        if (isEditing) {
          return (
            <Table.Td key={column.key}>
              <div ref={editInputRef}>
                <EditableCell
                  column={column}
                  value={value}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  saveEdit={saveEdit}
                  jsonData={jsonData}
                  onSave={(newValue) => {
                    if (editingCell && onDataChange) {
                      const newData = [...arrayData];
                      newData[editingCell.row] = {
                        ...newData[editingCell.row],
                        [editingCell.column]: newValue
                      };
                      onDataChange(newData);
                      cancelEditing();
                    }
                  }}
                  onCancel={cancelEditing}
                />
              </div>
            </Table.Td>
          );
        }

        // Handle foreign key display
        if (columnSchema.type === 'uuid' && columnSchema.foreignKey) {
          return (
            <Table.Td
              key={column.key}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                startEditing(index, column.key);
              }}
              style={{ cursor: 'pointer' }}
            >
              <ForeignKeyDisplayCell column={column} value={value} jsonData={jsonData} />
            </Table.Td>
          );
        }

        // Regular display for other types
        const displayValue = columnSchema.type === 'uuid' && value
          ? `${String(value).slice(0, 4)}..`
          : value !== null && value !== undefined ? String(value) : '';

        return (
          <Table.Td
            key={column.key}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              startEditing(index, column.key);
            }}
            style={{ cursor: 'pointer' }}
          >
            {displayValue}
          </Table.Td>
        );
      })}
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Button
            size="xs"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onRowSelect?.(index);
            }}
          >
            Edit
          </Button>
          {onDataChange && (
            <ActionIcon
              color="red"
              variant="subtle"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                removeItem(index);
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};