import type { PrimitiveSchema, StructedSchema, ValueSchema } from "./types";

export const STRUCTURED_SCHEMA_TYPES = {
  object: true,
  array: true,
} as const satisfies Record<StructedSchema["type"], true>;

export const PRIMITIVE_SCHEMA_TYPES = {
  string: true,
  enum: true,
  uuid: true,
  integer: true,
  number: true,
  boolean: true,
  vector2: true,
  vector3: true,
  vector4: true,
  vector2Int: true,
  vector3Int: true,
  vector4Int: true,
} as const satisfies Record<PrimitiveSchema["type"], true>;

export const VALUE_SCHEMA_TYPES = {
  ...STRUCTURED_SCHEMA_TYPES,
  ...PRIMITIVE_SCHEMA_TYPES,
} as const satisfies Record<ValueSchema["type"], true>;

function hasOwnSchemaType(
  schemaTypes: object,
  type: unknown,
): type is PropertyKey {
  return (
    typeof type === "string" &&
    Object.prototype.hasOwnProperty.call(schemaTypes, type)
  );
}

export function isValueSchemaType(
  type: unknown,
): type is ValueSchema["type"] {
  return hasOwnSchemaType(VALUE_SCHEMA_TYPES, type);
}

export function isPrimitiveSchemaType(
  type: unknown,
): type is PrimitiveSchema["type"] {
  return hasOwnSchemaType(PRIMITIVE_SCHEMA_TYPES, type);
}
