import { supportsForeignKey } from "./types";

import type {
  PrimitiveSchema,
  Schema,
  StructedSchema,
  ValueSchema,
} from "./types";

export interface RuntimeSwitchCaseSchema {
  when: string | number | boolean;
  type: string;
}

export interface RuntimeSwitchSchema {
  switch: string;
  cases: RuntimeSwitchCaseSchema[];
  optional?: boolean;
}

export type RuntimeFieldSchema =
  | Schema
  | RuntimeSwitchSchema
  | RuntimeSwitchCaseSchema;

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

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> => {
  return typeof value === "object" && value !== null;
};

const hasSafeForeignKeyShape = (foreignKey: unknown): boolean => {
  return (
    isRecord(foreignKey) &&
    typeof foreignKey.schemaId === "string" &&
    typeof foreignKey.foreignKeyIdPath === "string" &&
    typeof foreignKey.displayElementPath === "string" &&
    (foreignKey.hierarchyDisplayPaths === undefined ||
      (Array.isArray(foreignKey.hierarchyDisplayPaths) &&
        foreignKey.hierarchyDisplayPaths.every(
          (path) => typeof path === "string",
        )))
  );
};

const hasSafeRuntimeValueShape = (
  schema: unknown,
  visiting: WeakSet<object>,
): boolean => {
  if (!isRecord(schema) || typeof schema.type !== "string") {
    return false;
  }

  // Unknown discriminators remain structurally safe so callers can provide
  // their own non-fatal fallback instead of rejecting the containing switch.
  if (!isValueSchemaType(schema.type)) {
    return true;
  }

  if (visiting.has(schema)) {
    return false;
  }

  visiting.add(schema);

  let isSafe: boolean;
  if (schema.type === "object") {
    isSafe =
      schema.properties === undefined ||
      (Array.isArray(schema.properties) &&
        schema.properties.every(
          (property) =>
            isRecord(property) &&
            typeof property.key === "string" &&
            (hasSafeRuntimeValueShape(property, visiting) ||
              hasSafeRuntimeSwitchShape(property, visiting)),
        ));
  } else if (schema.type === "array") {
    isSafe = hasSafeRuntimeValueShape(schema.items, visiting);
  } else if (schema.type === "enum") {
    isSafe =
      Array.isArray(schema.options) &&
      schema.options.every((option) => typeof option === "string");
  } else if (supportsForeignKey(schema.type)) {
    isSafe =
      schema.foreignKey === undefined ||
      hasSafeForeignKeyShape(schema.foreignKey);
  } else {
    isSafe = true;
  }

  visiting.delete(schema);
  return isSafe;
};

const hasSafeRuntimeSwitchShape = (
  schema: unknown,
  visiting: WeakSet<object>,
): boolean => {
  if (
    !isRecord(schema) ||
    "type" in schema ||
    typeof schema.switch !== "string" ||
    !Array.isArray(schema.cases)
  ) {
    return false;
  }

  if (visiting.has(schema)) {
    return false;
  }

  visiting.add(schema);
  const isSafe = schema.cases.every(
    (candidate) =>
      isRecord(candidate) &&
      "when" in candidate &&
      (typeof candidate.when === "string" ||
        typeof candidate.when === "number" ||
        typeof candidate.when === "boolean") &&
      hasSafeRuntimeValueShape(candidate, visiting),
  );
  visiting.delete(schema);

  return isSafe;
};

export function isRuntimeValueSchema(
  schema: unknown,
): schema is ValueSchema {
  return (
    isRecord(schema) &&
    isValueSchemaType(schema.type) &&
    hasSafeRuntimeValueShape(schema, new WeakSet())
  );
}

export function isRuntimeSwitchSchema(
  schema: unknown,
): schema is RuntimeSwitchSchema {
  return hasSafeRuntimeSwitchShape(schema, new WeakSet());
}
