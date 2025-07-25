import React, { useMemo } from "react";

import { Select, Loader } from "@mantine/core";

import { useForeignKeyData } from "../../../hooks/useForeignKeyData";
import type { UuidSchema } from "../../../libs/schema/types";
import type { CellEditProps } from "../TableView.types";

interface ForeignKeyEditCellProps extends CellEditProps {
  column: any;
  jsonData?: any[];
}

export const ForeignKeyEditCell: React.FC<ForeignKeyEditCellProps> = ({ column, value, jsonData, onSave, onCancel }) => {
  const columnSchema = column as UuidSchema;
  
  const { options, loading, error } = useForeignKeyData(
    columnSchema.foreignKey,
    jsonData || [],
    value
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
      value={value || ''}
      onChange={(val) => {
        if (val !== null) {
          onSave(val || '');
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
      defaultDropdownOpened={true}
      comboboxProps={{ 
        transitionProps: { transition: 'fade', duration: 0 },
        withinPortal: false
      }}
    />
  );
};