import React from 'react';
import { Group, NumberInput } from '@mantine/core';
import { FormInputProps } from './types';

interface Vector2 {
  x: number;
  y: number;
}

export const Vector2Input: React.FC<FormInputProps<Vector2>> = ({ value, onChange, schema }) => {
  const allowDecimal = !schema.type.includes('Int');
  
  return (
    <Group gap="xs">
      <NumberInput
        placeholder="X"
        value={value?.x || 0}
        onChange={(val) => onChange({ ...value, x: val === '' ? 0 : Number(val) })}
        allowDecimal={allowDecimal}
        style={{ width: 100 }}
      />
      <NumberInput
        placeholder="Y"
        value={value?.y || 0}
        onChange={(val) => onChange({ ...value, y: val === '' ? 0 : Number(val) })}
        allowDecimal={allowDecimal}
        style={{ width: 100 }}
      />
    </Group>
  );
};