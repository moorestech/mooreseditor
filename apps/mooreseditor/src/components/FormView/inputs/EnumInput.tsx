import React from 'react';

import { Select } from '@mantine/core';

import type { FormInputProps } from './types';
import type { EnumSchema } from '../../../libs/schema/types';

export const EnumInput: React.FC<FormInputProps<string>> = ({ value, onChange, schema }) => {
  const enumSchema = schema as EnumSchema;
  
  return (
    <Select
      data={enumSchema.options || []}
      value={value || enumSchema.default || ''}
      onChange={(val) => onChange(val || '')}
      placeholder="Select an option"
      searchable
    />
  );
};