import React from 'react';
import { Group, NumberInput } from '@mantine/core';
import { FormInputProps } from './types';

interface Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export const Vector4Input: React.FC<FormInputProps<Vector4>> = ({ value, onChange, schema }) => {
  const allowDecimal = !schema.type.includes('Int');
  
  return (
    <Group gap="xs">
      <NumberInput
        placeholder="X"
        value={value?.x || 0}
        onChange={(val) => onChange({ ...value, x: val === '' ? 0 : Number(val) })}
        allowDecimal={allowDecimal}
        style={{ width: 70 }}
      />
      <NumberInput
        placeholder="Y"
        value={value?.y || 0}
        onChange={(val) => onChange({ ...value, y: val === '' ? 0 : Number(val) })}
        allowDecimal={allowDecimal}
        style={{ width: 70 }}
      />
      <NumberInput
        placeholder="Z"
        value={value?.z || 0}
        onChange={(val) => onChange({ ...value, z: val === '' ? 0 : Number(val) })}
        allowDecimal={allowDecimal}
        style={{ width: 70 }}
      />
      <NumberInput
        placeholder="W"
        value={value?.w || 0}
        onChange={(val) => onChange({ ...value, w: val === '' ? 0 : Number(val) })}
        allowDecimal={allowDecimal}
        style={{ width: 70 }}
      />
    </Group>
  );
};