import React, { useCallback, useMemo } from "react";

import { Group, NumberInput } from "@mantine/core";

import { useDebouncedCallback } from "../../../hooks/useDebounce";
import {
  arrayToVector2,
  vector2ToArray,
  isVectorArray,
} from "../../../utils/vectorConverter";

import type { FormInputProps } from "./types";
import type { Vector2Object } from "../../../utils/vectorConverter";

export const Vector2Input: React.FC<
  FormInputProps<Vector2Object | [number, number]>
> = React.memo(({ value, onChange, schema }) => {
  const allowDecimal = !schema.type.includes("Int");

  // Convert array format to object format for display
  const vectorObject = useMemo(() => {
    if (isVectorArray(value)) {
      return arrayToVector2(value as [number, number]);
    }
    return (value as Vector2Object) || { x: 0, y: 0 };
  }, [value]);

  const debouncedOnChange = useDebouncedCallback(
    (newValue: Vector2Object) => {
      // Convert back to array format for storage
      onChange(vector2ToArray(newValue));
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

  return (
    <Group gap="xs">
      <NumberInput
        placeholder="X"
        value={vectorObject.x}
        onChange={handleXChange}
        allowDecimal={allowDecimal}
        style={{ width: 100 }}
      />
      <NumberInput
        placeholder="Y"
        value={vectorObject.y}
        onChange={handleYChange}
        allowDecimal={allowDecimal}
        style={{ width: 100 }}
      />
    </Group>
  );
});
