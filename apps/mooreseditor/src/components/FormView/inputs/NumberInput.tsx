import React, { useState, useEffect, useCallback } from 'react';

import { NumberInput as MantineNumberInput } from '@mantine/core';

import { useDebouncedCallback } from '../../../hooks/useDebounce';

import type { FormInputProps } from './types';
import type { NumberSchema } from '../../../libs/schema/types';

export const NumberInput: React.FC<FormInputProps<number>> = React.memo(({ value, onChange, schema }) => {
  const numSchema = schema as NumberSchema;
  const [localValue, setLocalValue] = useState<number | ''>(value ?? '');
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);
  
  // Debounce the onChange callback
  const debouncedOnChange = useDebouncedCallback(
    (newValue: number) => {
      onChange(newValue);
    },
    300,
    [onChange]
  );
  
  const handleChange = useCallback((val: number | string) => {
    if (val === '') {
      setLocalValue('');
      debouncedOnChange(undefined as unknown as number);
    } else {
      const numValue = Number(val);
      setLocalValue(numValue);
      debouncedOnChange(numValue);
    }
  }, [debouncedOnChange]);
  
  return (
    <MantineNumberInput
      value={localValue}
      onChange={handleChange}
      min={numSchema.min}
      max={numSchema.max}
      decimalScale={2}
      thousandSeparator=","
    />
  );
});