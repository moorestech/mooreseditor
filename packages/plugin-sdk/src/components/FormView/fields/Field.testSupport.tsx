import { vi } from "vitest";

import type { PrimitiveSchema, Schema } from "../../../schema";

export const primitiveInputFamilies = {
  string: "string-input",
  enum: "enum-input",
  uuid: "uuid-input",
  integer: "integer-input",
  number: "number-input",
  boolean: "boolean-input",
  vector2: "vector2-input",
  vector3: "vector3-input",
  vector4: "vector4-input",
  vector2Int: "vector2-input",
  vector3Int: "vector3-input",
  vector4Int: "vector4-input",
} as const satisfies Record<PrimitiveSchema["type"], string>;

export const fieldInputMocks = {
  StringInput: ({ value, onChange }: any) => (
    <input
      data-testid="string-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
  IntegerInput: ({ value, onChange }: any) => (
    <input
      data-testid="integer-input"
      type="number"
      value={value}
      onChange={(event) => onChange(parseInt(event.target.value))}
    />
  ),
  NumberInput: ({ value, onChange }: any) => (
    <input
      data-testid="number-input"
      type="number"
      value={value}
      onChange={(event) => onChange(parseFloat(event.target.value))}
    />
  ),
  BooleanInput: ({ value, onChange }: any) => (
    <input
      data-testid="boolean-input"
      type="checkbox"
      checked={value}
      onChange={(event) => onChange(event.target.checked)}
    />
  ),
  EnumInput: ({ value, onChange, schema }: any) => (
    <select
      data-testid="enum-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {schema.enum?.map((option: any) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  ),
  UuidInput: ({ value, onChange }: any) => (
    <input
      data-testid="uuid-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
  Vector2Input: ({ value }: any) => (
    <div data-testid="vector2-input">{JSON.stringify(value)}</div>
  ),
  Vector3Input: ({ value }: any) => (
    <div data-testid="vector3-input">{JSON.stringify(value)}</div>
  ),
  Vector4Input: ({ value }: any) => (
    <div data-testid="vector4-input">{JSON.stringify(value)}</div>
  ),
  ForeignKeySelect: ({ value, onChange }: any) => (
    <select
      data-testid="foreignkey-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Select...</option>
    </select>
  ),
};

export const defaultFieldProps = {
  label: "Test Field",
  schema: { type: "string" } as Schema,
  data: "",
  onDataChange: vi.fn(),
  path: ["root", "testField"],
};

export const resetFieldMocks = (): void => {
  vi.clearAllMocks();
};
