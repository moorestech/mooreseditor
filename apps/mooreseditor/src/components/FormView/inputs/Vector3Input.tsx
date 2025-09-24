import React, { useCallback, useMemo } from "react";

import { Group, NumberInput } from "@mantine/core";

import { useDebouncedCallback } from "../../../hooks/useDebounce";
import {
  arrayToVector3,
  vector3ToArray,
  isVectorArray,
} from "../../../utils/vectorConverter";

import type { FormInputProps } from "./types";
import type { Vector3Object } from "../../../utils/vectorConverter";

export const Vector3Input: React.FC<
  FormInputProps<Vector3Object | [number, number, number]>
> = React.memo(({ value, onChange, schema }) => {
  const allowDecimal = !schema.type.includes("Int");

  // Convert array format to object format for display
  const vectorObject = useMemo(() => {
    if (isVectorArray(value)) {
      return arrayToVector3(value as [number, number, number]);
    }
    return (value as Vector3Object) || { x: 0, y: 0, z: 0 };
  }, [value]);

  const debouncedOnChange = useDebouncedCallback(
    (newValue: Vector3Object) => {
      // Convert back to array format for storage
      onChange(vector3ToArray(newValue));
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

  return (
    <Group gap="xs">
      <NumberInput
        placeholder="X"
        value={vectorObject.x}
        onChange={handleXChange}
        allowDecimal={allowDecimal}
        style={{ width: 80 }}
      />
      <NumberInput
        placeholder="Y"
        value={vectorObject.y}
        onChange={handleYChange}
        allowDecimal={allowDecimal}
        style={{ width: 80 }}
      />
      <NumberInput
        placeholder="Z"
        value={vectorObject.z}
        onChange={handleZChange}
        allowDecimal={allowDecimal}
        style={{ width: 80 }}
      />
    </Group>
  );
});
