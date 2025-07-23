import React, { useMemo, useCallback } from "react";

import { Table, Button, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import type { ObjectSchema } from "../../libs/schema/types";
import { useTableEdit } from "./hooks/useTableEdit";
import type { TableViewProps } from "./TableView.types";
import { createInitialValue } from "../../utils/createInitialValue";
import { TableRow } from "./components/TableRow";

export const TableView = ({ schema, data, jsonData, onDataChange, onRowSelect }: TableViewProps) => {
  if (data === undefined) {
    data = [];
  }
  const arrayData = data || [];

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
      const primitiveTypes = ['string', 'uuid', 'enum', 'integer', 'number'];
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

  if (!Array.isArray(data)) {
    return <Text>Invalid data</Text>;
  }
  
  return (
    <Stack gap="md">
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '50px' }}>#</Table.Th>
            {columns.map(column => (
              <Table.Th key={column.key}>{column.key}</Table.Th>
            ))}
            <Table.Th style={{ width: '80px' }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((row, index) => (
            <TableRow
              key={index}
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
          ))}
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
  );
};