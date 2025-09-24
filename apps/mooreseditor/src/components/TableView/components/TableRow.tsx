import React from "react";

import { Table, Button, Group, ActionIcon, Checkbox } from "@mantine/core";
import { IconTrash, IconCopy } from "@tabler/icons-react";

import { processSwitchFields } from "../../../utils/switchFieldProcessor";
import { EditableCell } from "../cells/EditableCell";
import { ForeignKeyDisplayCell } from "../cells/ForeignKeyDisplayCell";

import type { Column } from "../../../hooks/useJson";
import type { ObjectSchema } from "../../../libs/schema/types";
import type { EditingCell } from "../TableView.types";

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
  duplicateItem: (index: number) => void;
  arrayData: any[];
  jsonData?: Column[];
  itemSchema?: ObjectSchema;
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
  duplicateItem,
  arrayData,
  jsonData,
  itemSchema,
}) => {
  return (
    <>
      <Table.Td>{index}</Table.Td>
      {columns.map((column) => {
        const value = row[column.key];
        const columnSchema = column as any;
        const isEditing =
          editingCell?.row === index && editingCell?.column === column.key;

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
                      const updatedRow = {
                        ...newData[editingCell.row],
                        [editingCell.column]: newValue,
                      };

                      // switchフィールドの処理を適用
                      const processedRow = itemSchema
                        ? processSwitchFields(
                            itemSchema,
                            newData[editingCell.row],
                            updatedRow,
                            editingCell.column,
                          )
                        : updatedRow;

                      newData[editingCell.row] = processedRow;
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
        if (columnSchema.type === "uuid" && columnSchema.foreignKey) {
          return (
            <Table.Td
              key={column.key}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                startEditing(index, column.key);
              }}
              style={{ cursor: "pointer" }}
            >
              <ForeignKeyDisplayCell
                column={column}
                value={value}
                jsonData={jsonData}
              />
            </Table.Td>
          );
        }

        // Handle boolean display with direct editing
        if (columnSchema.type === "boolean") {
          return (
            <Table.Td
              key={column.key}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
              }}
            >
              <Checkbox
                checked={value ?? false}
                onChange={(e) => {
                  if (onDataChange) {
                    const newData = [...arrayData];
                    const updatedRow = {
                      ...newData[index],
                      [column.key]: e.currentTarget.checked,
                    };

                    // switchフィールドの処理を適用
                    const processedRow = itemSchema
                      ? processSwitchFields(
                          itemSchema,
                          newData[index],
                          updatedRow,
                          column.key,
                        )
                      : updatedRow;

                    newData[index] = processedRow;
                    onDataChange(newData);
                  }
                }}
                aria-label={`${column.key} ${value ? "true" : "false"}`}
                styles={{
                  input: { cursor: "pointer" },
                  root: { padding: "8px" },
                }}
              />
            </Table.Td>
          );
        }

        // Regular display for other types
        const displayValue =
          columnSchema.type === "uuid" && value
            ? `${String(value).slice(0, 4)}..`
            : value !== null && value !== undefined
              ? String(value)
              : "";

        return (
          <Table.Td
            key={column.key}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              startEditing(index, column.key);
            }}
            style={{ cursor: "pointer" }}
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
            <>
              <ActionIcon
                color="gray"
                variant="subtle"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  duplicateItem(index);
                }}
                title="複製"
              >
                <IconCopy size={16} />
              </ActionIcon>
              <ActionIcon
                color="red"
                variant="subtle"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  removeItem(index);
                }}
                title="削除"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </>
          )}
        </Group>
      </Table.Td>
    </>
  );
};
