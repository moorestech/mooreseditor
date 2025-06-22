import React from "react";

import { TextInput, NumberInput } from "@mantine/core";

import type { CellEditProps } from "../TableView.types";
import { EnumEditCell } from "./EnumEditCell";
import { ForeignKeyEditCell } from "./ForeignKeyEditCell";

interface EditableCellProps extends CellEditProps {
  column: any;
  editValue: any;
  setEditValue: (value: any) => void;
  saveEdit: () => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({ 
  column, 
  value, 
  editValue,
  setEditValue,
  saveEdit,
  onCancel 
}) => {
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
        onCancel={onCancel}
      />
    );
  }
  
  switch (columnSchema.type) {
    case 'integer':
      return (
        <NumberInput
          value={editValue || 0}
          onChange={(val) => setEditValue(val)}
          size="xs"
          styles={{ input: { minHeight: 'auto', height: '28px' } }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') onCancel();
          }}
          autoFocus
        />
      );
    case 'number':
      return (
        <NumberInput
          value={editValue || 0}
          onChange={(val) => setEditValue(val)}
          decimalScale={2}
          size="xs"
          styles={{ input: { minHeight: 'auto', height: '28px' } }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') onCancel();
          }}
          autoFocus
        />
      );
    case 'enum':
      return (
        <EnumEditCell
          column={column}
          value={editValue}
          onSave={(newValue) => {
            setEditValue(newValue);
            saveEdit();
          }}
          onCancel={onCancel}
        />
      );
    case 'string':
    case 'uuid':  // Regular uuid without foreign key
    default:
      return (
        <TextInput
          value={editValue || ''}
          onChange={(e) => setEditValue(e.currentTarget.value)}
          size="xs"
          styles={{ input: { minHeight: 'auto', height: '28px' } }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') onCancel();
          }}
          autoFocus
        />
      );
  }
};