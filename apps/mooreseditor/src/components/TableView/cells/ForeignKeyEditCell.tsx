import React, { useState, useMemo } from "react";

import { Select, Loader } from "@mantine/core";

import { useForeignKeyData } from "../../../hooks/useForeignKeyData";
import { useProject } from "../../../hooks/useProject";
import type { UuidSchema } from "../../../libs/schema/types";
import type { CellEditProps } from "../TableView.types";

interface ForeignKeyEditCellProps extends CellEditProps {
  column: any;
}

export const ForeignKeyEditCell: React.FC<ForeignKeyEditCellProps> = ({ column, value, onSave, onCancel }) => {
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