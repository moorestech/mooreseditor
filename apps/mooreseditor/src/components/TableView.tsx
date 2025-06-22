import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { Table, Button, Stack, Group, Text, ActionIcon, TextInput, NumberInput, Select, Loader } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { ArraySchema, ObjectSchema, ValueSchema, UuidSchema } from "../libs/schema/types";
import { useForeignKeyData } from "../hooks/useForeignKeyData";
import { useProject } from "../hooks/useProject";

// Component for displaying foreign key value in table cell
const ForeignKeyDisplayCell: React.FC<{
  column: any;
  value: string;
}> = ({ column, value }) => {
  const { projectDir } = useProject();
  const columnSchema = column as UuidSchema;
  
  const { displayValue, loading, error } = useForeignKeyData(
    columnSchema.foreignKey,
    projectDir,
    value
  );

  if (!value) {
    return <Text size="sm" c="dimmed">-</Text>;
  }

  if (loading) {
    return <Text size="sm" c="dimmed">Loading...</Text>;
  }

  if (error) {
    return <Text size="sm" c="dimmed" title={value}>{value.slice(0, 8)}...</Text>;
  }

  return <Text size="sm" title={value}>{displayValue || `${value.slice(0, 8)}...`}</Text>;
};

// Component for rendering enum select in table cell
const EnumEditCell: React.FC<{
  column: any;
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}> = ({ column, value, onSave, onCancel }) => {
  const columnSchema = column as any;
  const selectRef = useRef<HTMLInputElement>(null);
  
  // Auto-open dropdown on mount
  useEffect(() => {
    if (selectRef.current) {
      // Small delay to ensure the component is fully mounted
      setTimeout(() => {
        selectRef.current?.click();
      }, 50);
    }
  }, []);

  return (
    <Select
      ref={selectRef}
      value={value || ''}
      onChange={(val) => {
        if (val !== null) {
          setTimeout(() => onSave(val || ''), 0);
        }
      }}
      data={columnSchema.options || []}
      size="xs"
      styles={{ input: { minHeight: 'auto', height: '28px' } }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
        if (e.key === 'Enter') e.preventDefault();
      }}
      autoFocus
      searchable={false}
      allowDeselect={false}
      withCheckIcon={false}
      comboboxProps={{ 
        transitionProps: { transition: 'fade', duration: 0 }
      }}
    />
  );
};

// Component for rendering foreign key select in table cell
const ForeignKeyEditCell: React.FC<{
  column: any;
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}> = ({ column, value, onSave, onCancel }) => {
  const { projectDir } = useProject();
  const [localValue, setLocalValue] = useState(value);
  const columnSchema = column as UuidSchema;
  
  const { options, loading, error } = useForeignKeyData(
    columnSchema.foreignKey,
    projectDir,
    localValue
  );

  const selectData = useMemo(() => {
    return options.map(option => ({
      value: option.id,
      label: option.display
    }));
  }, [options]);

  if (loading) {
    return (
      <Select
        placeholder="Loading..."
        disabled
        size="xs"
        styles={{ input: { minHeight: 'auto', height: '28px' } }}
        rightSection={<Loader size="xs" />}
      />
    );
  }

  if (error) {
    return (
      <Select
        placeholder={error}
        disabled
        error
        size="xs"
        styles={{ input: { minHeight: 'auto', height: '28px' } }}
      />
    );
  }

  return (
    <Select
      data={selectData}
      value={localValue || ''}
      onChange={(val) => {
        setLocalValue(val || '');
        if (val !== null) {
          setTimeout(() => onSave(val || ''), 0);
        }
      }}
      placeholder={`Select ${columnSchema.foreignKey?.schemaId}`}
      searchable
      size="xs"
      styles={{ input: { minHeight: 'auto', height: '28px' } }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
        if (e.key === 'Enter') e.preventDefault();
      }}
      autoFocus
      withCheckIcon={false}
      comboboxProps={{ 
        transitionProps: { transition: 'fade', duration: 0 }
      }}
    />
  );
};

interface Props {
  schema: ArraySchema;
  data: any[];
  onDataChange?: (newData: any[]) => void;
  onRowSelect?: (rowIndex: number) => void;
}

export const TableView = ({ schema, data, onDataChange, onRowSelect }: Props) => {
  const arrayData = data || [];
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const editInputRef = useRef<HTMLDivElement>(null);
  const { projectDir } = useProject();

  const cancelEditing = useCallback(() => {
    setEditingCell(null);
    setEditValue(null);
  }, []);

  // Handle click outside to cancel editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingCell && editInputRef.current && !editInputRef.current.contains(event.target as Node)) {
        cancelEditing();
      }
    };

    if (editingCell) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingCell, cancelEditing]);
  
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
  
  const getDefaultValue = useCallback((itemSchema: ValueSchema): any => {
    if ('type' in itemSchema) {
      switch (itemSchema.type) {
        case 'string':
          return itemSchema.default || '';
        case 'uuid':
          // Check if the UUID should be auto-generated
          if ('autoGenerated' in itemSchema && itemSchema.autoGenerated) {
            return crypto.randomUUID();
          }
          return '';
        case 'enum':
          return itemSchema.default || '';
        case 'integer':
          return itemSchema.default || 0;
        case 'number':
          return itemSchema.default || 0;
        case 'boolean':
          return itemSchema.default || false;
        case 'vector2':
        case 'vector2Int':
          return { x: 0, y: 0 };
        case 'vector3':
        case 'vector3Int':
          return { x: 0, y: 0, z: 0 };
        case 'vector4':
        case 'vector4Int':
          return { x: 0, y: 0, z: 0, w: 0 };
        case 'object': {
          const obj: any = {};
          if (itemSchema.properties) {
            itemSchema.properties.forEach(prop => {
              const { key, ...propSchema } = prop;
              if ('type' in propSchema) {
                obj[key] = getDefaultValue(propSchema as ValueSchema);
              }
            });
          }
          return obj;
        }
        case 'array':
          return [];
        default:
          return null;
      }
    }
    return null;
  }, []);
  
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
  }, [data, schema.items, getDefaultValue, onDataChange]);
  
  const removeItem = useCallback((index: number) => {
    if (onDataChange) {
      const currentArray = Array.isArray(data) ? data : [];
      const newArray = [...currentArray];
      newArray.splice(index, 1);
      onDataChange(newArray);
    }
  }, [data, onDataChange]);

  const startEditing = useCallback((row: number, column: string) => {
    const value = data[row]?.[column];
    setEditingCell({ row, column });
    setEditValue(value);
  }, [data]);

  const saveEdit = useCallback(() => {
    if (editingCell && onDataChange) {
      const newData = [...data];
      newData[editingCell.row] = {
        ...newData[editingCell.row],
        [editingCell.column]: editValue
      };
      onDataChange(newData);
    }
    cancelEditing();
  }, [editingCell, editValue, data, onDataChange, cancelEditing]);

  const renderEditInput = useCallback((column: any, value: any) => {
    const columnSchema = column as any;
    
    // Handle uuid with foreign key
    if (columnSchema.type === 'uuid' && columnSchema.foreignKey) {
      return (
        <ForeignKeyEditCell
          column={column}
          value={value}
          onSave={(newValue) => {
            setEditValue(newValue);
            saveEdit();
          }}
          onCancel={cancelEditing}
        />
      );
    }
    
    switch (columnSchema.type) {
      case 'integer':
        return (
          <NumberInput
            value={value || 0}
            onChange={(val) => setEditValue(val)}
            size="xs"
            styles={{ input: { minHeight: 'auto', height: '28px' } }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEditing();
            }}
            autoFocus
          />
        );
      case 'number':
        return (
          <NumberInput
            value={value || 0}
            onChange={(val) => setEditValue(val)}
            decimalScale={2}
            size="xs"
            styles={{ input: { minHeight: 'auto', height: '28px' } }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEditing();
            }}
            autoFocus
          />
        );
      case 'enum':
        return (
          <EnumEditCell
            column={column}
            value={value}
            onSave={(newValue) => {
              setEditValue(newValue);
              saveEdit();
            }}
            onCancel={cancelEditing}
          />
        );
      case 'string':
      case 'uuid':  // Regular uuid without foreign key
      default:
        return (
          <TextInput
            value={value || ''}
            onChange={(e) => setEditValue(e.currentTarget.value)}
            size="xs"
            styles={{ input: { minHeight: 'auto', height: '28px' } }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEditing();
            }}
            autoFocus
          />
        );
    }
  }, [saveEdit, cancelEditing]);
  
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
                        {renderEditInput(column, editValue)}
                      </div>
                    </Table.Td>
                  );
                }
                
                // Handle foreign key display
                if (columnSchema.type === 'uuid' && columnSchema.foreignKey) {
                  return (
                    <Table.Td 
                      key={column.key}
                      onDoubleClick={(e: React.MouseEvent) => {
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
                  : String(value || '');
                  
                return (
                  <Table.Td 
                    key={column.key}
                    onDoubleClick={(e: React.MouseEvent) => {
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