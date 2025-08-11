import React, { useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Table, Button, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import type { ObjectSchema } from "../../libs/schema/types";
import { useTableEdit } from "./hooks/useTableEdit";
import type { TableViewProps } from "./TableView.types";
import { createInitialValue } from "../../utils/createInitialValue";
import { TableRow } from "./components/TableRow";
import { SortableRow } from "./components/SortableRow";

export const TableView = ({ schema, data, jsonData, onDataChange, onRowSelect }: TableViewProps) => {
  if (data === undefined) {
    data = [];
  }
  const arrayData = data || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    editingCell,
    editValue,
    setEditValue,
    editInputRef,
    startEditing,
    saveEdit,
    cancelEditing
  } = useTableEdit(arrayData, onDataChange);

  const columns = useMemo(() => {
    if (!schema.items || !('type' in schema.items) || schema.items.type !== 'object') {
      return [];
    }

    const objectSchema = schema.items as ObjectSchema;
    if (!objectSchema.properties) {
      return [];
    }

    // Filter primitive type properties (including uuid with foreign keys)
    return objectSchema.properties.filter(prop => {
      if (!('type' in prop)) return false;
      const propSchema = prop as any;
      const primitiveTypes = ['string', 'uuid', 'enum', 'integer', 'number', 'boolean'];
      return primitiveTypes.includes(propSchema.type);
    });
  }, [schema]);

  const addItem = useCallback(() => {
    console.log('TableView addItem called', { data, schema, onDataChange: !!onDataChange });
    if (onDataChange && schema.items) {
      const currentArray = Array.isArray(data) ? data : [];
      const newArray = [...currentArray];
      const defaultValue = createInitialValue(schema.items, newArray);
      console.log('Adding item with default value:', defaultValue);
      newArray.push(defaultValue);
      onDataChange(newArray);
    }
  }, [data, schema.items, onDataChange]);

  const removeItem = useCallback((index: number) => {
    if (onDataChange) {
      const currentArray = Array.isArray(data) ? data : [];
      const newArray = [...currentArray];
      newArray.splice(index, 1);
      onDataChange(newArray);
    }
  }, [data, onDataChange]);


  // Generate items using stable IDs from data
  const items = useMemo(() => {
    return arrayData.map((_, index) => {
      return `index-${index}`;
    });
  }, [arrayData]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && onDataChange) {
      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(String(over?.id));

      const newData = arrayMove(arrayData, oldIndex, newIndex);
      onDataChange(newData);
    }
  }, [arrayData, onDataChange, items]);

  if (!Array.isArray(data)) {
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
              <Table.Th style={{ width: '40px' }}></Table.Th>
              <Table.Th style={{ width: '50px' }}>#</Table.Th>
              {columns.map(column => (
                <Table.Th key={column.key}>{column.key}</Table.Th>
              ))}
              <Table.Th style={{ width: '80px' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              {data.map((row, index) => {
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
                  arrayData={arrayData}
                  jsonData={jsonData}
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
