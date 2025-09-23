import React, { useState, useEffect, useCallback } from 'react';

import { TextInput, Textarea } from '@mantine/core';

import { useDebouncedCallback } from '../../../hooks/useDebounce';

import type { FormInputProps } from './types';
import type { StringSchema } from '../../../libs/schema/types';

export const StringInput: React.FC<FormInputProps<string>> = React.memo(({ value, onChange, schema }) => {
  const stringSchema = schema as StringSchema;
  const [localValue, setLocalValue] = useState(value || '');
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);
  
  // Debounce the onChange callback
  const debouncedOnChange = useDebouncedCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    300,
    [onChange]
  );
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.currentTarget.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  }, [debouncedOnChange]);
  
  if (stringSchema.style?.multiline || (stringSchema.default && stringSchema.default.length > 50)) {
    return (
      <Textarea
        value={localValue}
        onChange={handleChange}
        placeholder={stringSchema.default}
        autosize
        minRows={2}
        maxRows={4}
      />
    );
  }
  
  return (
    <TextInput
      value={localValue}
      onChange={handleChange}
      placeholder={stringSchema.default}
    />
  );
});