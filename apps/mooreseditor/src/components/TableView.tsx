import React, { useMemo } from "react";
import { Table, Button, Stack, Group, Text } from "@mantine/core";
import type { ArraySchema, ObjectSchema } from "../libs/schema/types";

interface Props {
  schema: ArraySchema;
  data: any[];
  onDataChange?: (newData: any[]) => void;
  onRowSelect?: (rowIndex: number) => void;
}

export const TableView = ({ schema, data, onDataChange, onRowSelect }: Props) => {
  const columns = useMemo(() => {
    if (!schema.items || !('type' in schema.items) || schema.items.type !== 'object') {
      return [];
    }
    
    const objectSchema = schema.items as ObjectSchema;
    if (!objectSchema.properties) {
      return [];
    }
    
    // Filter primitive type properties
    return objectSchema.properties.filter(prop => {
      if (!('type' in prop)) return false;
      const propSchema = prop as any;
      const primitiveTypes = ['string', 'uuid', 'enum', 'integer', 'number'];
      return primitiveTypes.includes(propSchema.type);
    });
  }, [schema]);
  
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
              {columns.map(column => (
                <Table.Td key={column.key}>
                  {String(row[column.key] || '')}
                </Table.Td>
              ))}
              <Table.Td>
                <Button
                  size="xs"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onRowSelect?.(index);
                  }}
                >
                  Edit
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};