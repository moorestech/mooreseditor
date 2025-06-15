import React, { useCallback } from 'react';
import { Group, NumberInput } from '@mantine/core';
import { FormInputProps } from './types';
import { useDebouncedCallback } from '../../../hooks/useDebounce';

interface Vector2 {
  x: number;
  y: number;
}

export const Vector2Input: React.FC<FormInputProps<Vector2>> = React.memo(({ value, onChange, schema }) => {
  const allowDecimal = !schema.type.includes('Int');
  
  const debouncedOnChange = useDebouncedCallback(
    (newValue: Vector2) => {
      onChange(newValue);
    },
    300,
    [onChange]
  );
  
  const handleXChange = useCallback((val: number | string) => {
    const numValue = val === '' ? 0 : Number(val);
    debouncedOnChange({ ...value, x: numValue });
  }, [value, debouncedOnChange]);
  
  const handleYChange = useCallback((val: number | string) => {
    const numValue = val === '' ? 0 : Number(val);
    debouncedOnChange({ ...value, y: numValue });
  }, [value, debouncedOnChange]);
  
  return (
    <Group gap="xs">
      <NumberInput
        placeholder="X"
        value={value?.x || 0}
        onChange={handleXChange}
        allowDecimal={allowDecimal}
        style={{ width: 100 }}
      />
      <NumberInput
        placeholder="Y"
        value={value?.y || 0}
        onChange={handleYChange}
        allowDecimal={allowDecimal}
        style={{ width: 100 }}
      />
    </Group>
  );
});