import React, { useMemo } from "react";

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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Table, Button, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import { useArrayDataManager } from "../../hooks/useArrayDataManager";

import { SortableRow } from "./components/SortableRow";
import { useTableEdit } from "./hooks/useTableEdit";

import type { TableViewProps } from "./TableView.types";
import type { ObjectSchema } from "../../libs/schema/types";

export const TableView = ({
  schema,
  data,
  jsonData,
  onDataChange,
  onRowSelect,
}: TableViewProps) => {
  // useArrayDataManagerフックを使用して共通ロジックを管理
  const {
    arrayData,
    addItem,
    removeItem,
    duplicateItem,
    handleDragEnd,
    items,
  } = useArrayDataManager({
    data,
    schema,
    onDataChange,
    useFullInitialization: false, // TableViewでは全フィールドを生成
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const {
    editingCell,
    editValue,
    setEditValue,
    editInputRef,
    startEditing,
    saveEdit,
    cancelEditing,
  } = useTableEdit(arrayData, onDataChange);

  const columns = useMemo(() => {
    if (
      !schema.items ||
      !("type" in schema.items) ||
      schema.items.type !== "object"
    ) {
      return [];
    }

    const objectSchema = schema.items as ObjectSchema;
    if (!objectSchema.properties) {
      return [];
    }

    // Filter primitive type properties (including uuid with foreign keys)
    return objectSchema.properties.filter((prop) => {
      if (!("type" in prop)) return false;
      const propSchema = prop as any;
      const primitiveTypes = [
        "string",
        "uuid",
        "enum",
        "integer",
        "number",
        "boolean",
      ];
      return primitiveTypes.includes(propSchema.type);
    });
  }, [schema]);

  const isDataMissing = data === undefined || data === null;
  if (!isDataMissing && !Array.isArray(data)) {
    return <Text>Invalid data</Text>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Stack gap="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "40px" }}></Table.Th>
              <Table.Th style={{ width: "50px" }}>#</Table.Th>
              {columns.map((column) => {
                // 文字数に基づいて最小幅を計算（文字あたり10px + パディング32px、最小120px）
                const minWidth = Math.max(120, column.key.length * 10 + 32);
                return (
                  <Table.Th key={column.key} style={{ minWidth }}>
                    {column.key}
                  </Table.Th>
                );
              })}
              <Table.Th style={{ width: "80px" }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              {arrayData.map((row, index) => {
                const itemId = items[index];
                return (
                  <SortableRow
                    key={itemId}
                    id={itemId}
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
                    duplicateItem={duplicateItem}
                    arrayData={arrayData}
                    jsonData={jsonData}
                    itemSchema={
                      schema.items &&
                      "type" in schema.items &&
                      schema.items.type === "object"
                        ? (schema.items as ObjectSchema)
                        : undefined
                    }
                  />
                );
              })}
            </SortableContext>
          </Table.Tbody>
        </Table>
        {onDataChange && (
          <Button
            variant="light"
            size="sm"
            leftSection={<IconPlus size={16} />}
            onClick={addItem}
          >
            Add Item
          </Button>
        )}
      </Stack>
    </DndContext>
  );
};
