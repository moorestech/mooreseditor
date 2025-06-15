import React from 'react';
import { TextInput } from '@mantine/core';
import { FormInputProps } from './types';

export const UuidInput: React.FC<FormInputProps<string>> = ({ value, onChange }) => {
  return (
    <TextInput
      value={value || ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder="00000000-0000-0000-0000-000000000000"
      style={{ fontFamily: 'monospace' }}
    />
  );
};