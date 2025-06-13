import React from 'react';
import { Group, NumberInput } from '@mantine/core';
import { FormInputProps } from './types';

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export const Vector3Input: React.FC<FormInputProps<Vector3>> = ({ value, onChange, schema }) => {
  const allowDecimal = !schema.type.includes('Int');
  
  return (
    <Group gap="xs">
      <NumberInput
        placeholder="X"
        value={value?.x || 0}
        onChange={(val) => onChange({ ...value, x: val === '' ? 0 : Number(val) })}
        allowDecimal={allowDecimal}
        style={{ width: 80 }}
      />
      <NumberInput
        placeholder="Y"
        value={value?.y || 0}
        onChange={(val) => onChange({ ...value, y: val === '' ? 0 : Number(val) })}
        allowDecimal={allowDecimal}
        style={{ width: 80 }}
      />
      <NumberInput
        placeholder="Z"
        value={value?.z || 0}
        onChange={(val) => onChange({ ...value, z: val === '' ? 0 : Number(val) })}
        allowDecimal={allowDecimal}
        style={{ width: 80 }}
      />
    </Group>
  );
};