import React, { useCallback, useMemo } from "react";

import { Group, NumberInput } from "@mantine/core";

import { useDebouncedCallback } from "../../../hooks/useDebounce";
import {
  arrayToVector4,
  vector4ToArray,
  isVectorArray,
} from "../../../utils/vectorConverter";

import type { FormInputProps } from "./types";
import type { Vector4Object } from "../../../utils/vectorConverter";

export const Vector4Input: React.FC<
  FormInputProps<Vector4Object | [number, number, number, number]>
> = React.memo(({ value, onChange, schema }) => {
  const allowDecimal = !schema.type.includes("Int");

  // Convert array format to object format for display
  const vectorObject = useMemo(() => {
    if (isVectorArray(value)) {
      return arrayToVector4(value as [number, number, number, number]);
    }
    return (value as Vector4Object) || { x: 0, y: 0, z: 0, w: 0 };
  }, [value]);

  const debouncedOnChange = useDebouncedCallback(
    (newValue: Vector4Object) => {
      // Convert back to array format for storage
      onChange(vector4ToArray(newValue));
    },
    300,
    [onChange],
  );

  const handleXChange = useCallback(
    (val: number | string) => {
      const numValue = val === "" ? undefined : Number(val);
      debouncedOnChange({ ...vectorObject, x: numValue as number });
    },
    [vectorObject, debouncedOnChange],
  );

  const handleYChange = useCallback(
    (val: number | string) => {
      const numValue = val === "" ? undefined : Number(val);
      debouncedOnChange({ ...vectorObject, y: numValue as number });
    },
    [vectorObject, debouncedOnChange],
  );

  const handleZChange = useCallback(
    (val: number | string) => {
      const numValue = val === "" ? undefined : Number(val);
      debouncedOnChange({ ...vectorObject, z: numValue as number });
    },
    [vectorObject, debouncedOnChange],
  );

  const handleWChange = useCallback(
    (val: number | string) => {
      const numValue = val === "" ? undefined : Number(val);
      debouncedOnChange({ ...vectorObject, w: numValue as number });
    },
    [vectorObject, debouncedOnChange],
  );

  return (
    <Group gap="xs">
      <NumberInput
        placeholder="X"
        value={vectorObject.x}
        onChange={handleXChange}
        allowDecimal={allowDecimal}
        style={{ width: 70 }}
      />
      <NumberInput
        placeholder="Y"
        value={vectorObject.y}
        onChange={handleYChange}
        allowDecimal={allowDecimal}
        style={{ width: 70 }}
      />
      <NumberInput
        placeholder="Z"
        value={vectorObject.z}
        onChange={handleZChange}
        allowDecimal={allowDecimal}
        style={{ width: 70 }}
      />
      <NumberInput
        placeholder="W"
        value={vectorObject.w}
        onChange={handleWChange}
        allowDecimal={allowDecimal}
        style={{ width: 70 }}
      />
    </Group>
  );
});
