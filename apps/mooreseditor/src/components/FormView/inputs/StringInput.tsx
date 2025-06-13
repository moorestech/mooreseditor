import React from 'react';
import { TextInput, Textarea } from '@mantine/core';
import { FormInputProps } from './types';
import type { StringSchema } from '../../../libs/schema/types';

export const StringInput: React.FC<FormInputProps<string>> = ({ value, onChange, schema }) => {
  const stringSchema = schema as StringSchema;
  
  if (stringSchema.default && stringSchema.default.length > 50) {
    return (
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder={stringSchema.default}
        autosize
        minRows={2}
        maxRows={4}
      />
    );
  }
  
  return (
    <TextInput
      value={value || ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder={stringSchema.default}
    />
  );
};