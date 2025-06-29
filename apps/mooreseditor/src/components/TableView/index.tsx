import React, { useMemo, useCallback } from "react";

import { Table, Button, Stack, Group, Text, ActionIcon } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import type { ObjectSchema } from "../../libs/schema/types";
import { ForeignKeyDisplayCell } from "./cells/ForeignKeyDisplayCell";
import { EditableCell } from "./cells/EditableCell";
import { useTableEdit } from "./hooks/useTableEdit";
import type { TableViewProps } from "./TableView.types";
import { getDefaultValue } from "./utils/defaultValues";

export const TableView = ({ schema, data, onDataChange, onRowSelect }: TableViewProps) => {
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
      const defaultValue = getDefaultValue(schema.items);
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
            <Table.Tr 
              key={index}
              onClick={() => onRowSelect?.(index)}
              style={{ cursor: onRowSelect ? 'pointer' : 'default' }}
            >
              <Table.Td>{index + 1}</Table.Td>
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
                      <ForeignKeyDisplayCell column={column} value={value} />
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