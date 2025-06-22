import React, { useRef, useEffect } from "react";

import { Select } from "@mantine/core";

import type { CellEditProps } from "../TableView.types";

interface EnumEditCellProps extends CellEditProps {
  column: any;
}

export const EnumEditCell: React.FC<EnumEditCellProps> = ({ column, value, onSave, onCancel }) => {
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