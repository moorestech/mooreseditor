import { describe, expect, it } from "vitest";

import {
  PRIMITIVE_SCHEMA_TYPES,
  STRUCTURED_SCHEMA_TYPES,
  VALUE_SCHEMA_TYPES,
  isPrimitiveSchemaType,
  isValueSchemaType,
} from "./schemaTypes";

const valueSchemaTypes = [
  "object",
  "array",
  "string",
  "enum",
  "uuid",
  "integer",
  "number",
  "boolean",
  "vector2",
  "vector3",
  "vector4",
  "vector2Int",
  "vector3Int",
  "vector4Int",
] as const;

const primitiveSchemaTypes = valueSchemaTypes.slice(2);

describe("schema types", () => {
  it("enumerates every current value, structured, and primitive schema kind", () => {
    expect(Object.keys(VALUE_SCHEMA_TYPES)).toEqual(valueSchemaTypes);
    expect(Object.keys(STRUCTURED_SCHEMA_TYPES)).toEqual(["object", "array"]);
    expect(Object.keys(PRIMITIVE_SCHEMA_TYPES)).toEqual(primitiveSchemaTypes);
  });

  it.each(valueSchemaTypes)("recognizes the value schema kind %s", (type) => {
    expect(isValueSchemaType(type)).toBe(true);
  });

  it.each(primitiveSchemaTypes)(
    "recognizes the primitive schema kind %s",
    (type) => {
      expect(isPrimitiveSchemaType(type)).toBe(true);
    },
  );

  it.each(["unknown", "toString", "__proto__", "", null, undefined, 0, {}])(
    "rejects an unknown or non-string value schema kind: %j",
    (type) => {
      expect(isValueSchemaType(type)).toBe(false);
      expect(isPrimitiveSchemaType(type)).toBe(false);
    },
  );

  it.each(["object", "array"])(
    "does not classify the structured schema kind %s as primitive",
    (type) => {
      expect(isPrimitiveSchemaType(type)).toBe(false);
    },
  );
});
