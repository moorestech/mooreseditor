import React from 'react';
import { NumberInput as MantineNumberInput } from '@mantine/core';
import { FormInputProps } from './types';
import type { NumberSchema } from '../../../libs/schema/types';

export const NumberInput: React.FC<FormInputProps<number>> = ({ value, onChange, schema }) => {
  const numSchema = schema as NumberSchema;
  
  return (
    <MantineNumberInput
      value={value || 0}
      onChange={(val) => onChange(val === '' ? 0 : Number(val))}
      min={numSchema.min}
      max={numSchema.max}
      decimalScale={2}
      thousandSeparator=","
    />
  );
};