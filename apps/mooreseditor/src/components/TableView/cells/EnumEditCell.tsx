import React, { useRef } from "react";

import { Select } from "@mantine/core";

import type { CellEditProps } from "../TableView.types";

interface EnumEditCellProps extends CellEditProps {
  column: any;
}

export const EnumEditCell: React.FC<EnumEditCellProps> = ({ column, value, onSave, onCancel }) => {
  const columnSchema = column as any;
  const selectRef = useRef<HTMLInputElement>(null);

  return (
    <Select
      ref={selectRef}
      value={value || ''}
      onChange={(val) => {
        if (val !== null) {
          onSave(val || '');
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
      defaultDropdownOpened={true}
      comboboxProps={{ 
        transitionProps: { transition: 'fade', duration: 0 },
        withinPortal: false
      }}
    />
  );
};