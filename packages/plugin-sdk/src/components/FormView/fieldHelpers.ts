import {
  isPrimitiveSchemaType,
  isValueSchemaType,
} from "../../schema";

import type { RuntimeSwitchSchema } from "./fieldTypes";
import type {
  ArraySchema,
  ObjectSchema,
  PrimitiveSchema,
  ValueSchema,
} from "../../schema";

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> => {
  return typeof value === "object" && value !== null;
};

const hasSafeRuntimeValueShape = (
  schema: unknown,
  visiting: WeakSet<object>,
): boolean => {
  if (!isRecord(schema) || typeof schema.type !== "string") {
    return false;
  }

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

/**
 * 型ガード関数：スキーマがValueSchemaかどうかを判定
 */
export const isValueSchema = (schema: unknown): schema is ValueSchema => {
  return (
    isRecord(schema) &&
    isValueSchemaType(schema.type) &&
    hasSafeRuntimeValueShape(schema, new WeakSet())
  );
};

/**
 * 型ガード関数：スキーマがSwitchSchemaかどうかを判定
 */
export const isSwitchSchema = (
  schema: unknown,
): schema is RuntimeSwitchSchema => {
  return hasSafeRuntimeSwitchShape(schema, new WeakSet());
};

/**
 * 型ガード関数：スキーマがPrimitiveSchemaかどうかを判定
 */
export const isPrimitiveSchema = (
  schema: unknown,
): schema is PrimitiveSchema => {
  return isRecord(schema) && isPrimitiveSchemaType(schema.type);
};

/**
 * 型ガード関数：スキーマがオブジェクト配列かどうかを判定
 */
export const isObjectArraySchema = (
  schema: ArraySchema,
): schema is ArraySchema & { items: ObjectSchema } => {
  return isValueSchema(schema.items) && schema.items.type === "object";
};
