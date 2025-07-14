import React, { useMemo } from 'react';
import { Select, Loader, Text } from '@mantine/core';
import { FormInputProps } from './types';
import type { UuidSchema } from '../../../libs/schema/types';
import { useForeignKeyData } from '../../../hooks/useForeignKeyData';

export const ForeignKeySelect: React.FC<FormInputProps<string>> = ({ 
  value, 
  onChange, 
  schema,
  jsonData
}) => {
  const uuidSchema = schema as UuidSchema;
  
  console.log('ForeignKeySelect rendered:', { 
    foreignKey: uuidSchema.foreignKey, 
    jsonData, 
    value 
  });
  
  const { 
    options, 
    loading, 
    error, 
    displayValue 
  } = useForeignKeyData(
    uuidSchema.foreignKey,
    jsonData || [],
    value
  );

  console.log('ForeignKeySelect data:', { 
    options, 
    loading, 
    error,
    displayValue 
  });

  // Convert options to Mantine Select format
  const selectData = useMemo(() => {
    return options.map(option => ({
      value: option.id,
      label: option.display
    }));
  }, [options]);

  if (!uuidSchema.foreignKey) {
    return <Text c="red">Foreign key configuration missing</Text>;
  }

  if (loading) {
    return (
      <Select
        placeholder="Loading..."
        disabled
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
      />
    );
  }

  return (
    <Select
      data={selectData}
      value={value || ''}
      onChange={(val) => onChange(val || '')}
      placeholder={`Select ${uuidSchema.foreignKey.schemaId}`}
      searchable
      clearable={uuidSchema.optional}
      nothingFoundMessage="No options found"
      // Show current display value even if the ID is not in current options
      // This handles cases where the referenced item might have been deleted
      renderOption={({ option }) => (
        <Text size="sm">{option.label}</Text>
      )}
    />
  );
};