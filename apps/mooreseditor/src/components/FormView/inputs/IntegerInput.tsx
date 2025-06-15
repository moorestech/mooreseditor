import React from 'react';
import { NumberInput } from '@mantine/core';
import { FormInputProps } from './types';
import type { IntegerSchema } from '../../../libs/schema/types';

export const IntegerInput: React.FC<FormInputProps<number>> = ({ value, onChange, schema }) => {
  const intSchema = schema as IntegerSchema;
  
  return (
    <NumberInput
      value={value || 0}
      onChange={(val) => onChange(val === '' ? 0 : Number(val))}
      min={intSchema.min}
      max={intSchema.max}
      allowDecimal={false}
      thousandSeparator=","
    />
  );
};