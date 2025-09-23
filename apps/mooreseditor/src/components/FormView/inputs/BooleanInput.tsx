import React from 'react';

import { Switch } from '@mantine/core';

import type { FormInputProps } from './types';

export const BooleanInput: React.FC<FormInputProps<boolean>> = ({ value, onChange }) => {
  return (
    <Switch
      checked={value || false}
      onChange={(e) => onChange(e.currentTarget.checked)}
    />
  );
};