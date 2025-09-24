import React from 'react';

import { TextInput } from '@mantine/core';

import { ForeignKeySelect } from './ForeignKeySelect';

import type { FormInputProps } from './types';
import type { UuidSchema } from '../../../libs/schema/types';

export const UuidInput: React.FC<FormInputProps<string>> = ({ value, onChange, schema, jsonData }) => {
  const uuidSchema = schema as UuidSchema;
  
  // If foreign key is configured, use ForeignKeySelect
  if (uuidSchema.foreignKey) {
    return (
      <ForeignKeySelect
        value={value}
        onChange={onChange}
        schema={schema}
        jsonData={jsonData}
      />
    );
  }
  
  // Otherwise, use regular text input for UUID
  return (
    <TextInput
      value={value || ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder="00000000-0000-0000-0000-000000000000"
      style={{ fontFamily: 'monospace' }}
    />
  );
};