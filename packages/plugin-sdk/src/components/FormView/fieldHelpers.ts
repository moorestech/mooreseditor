import {
  isPrimitiveSchemaType,
  isValueSchemaType,
} from "../../schema";

import type {
  ArraySchema,
  ObjectSchema,
  PrimitiveSchema,
  SwitchSchema,
  ValueSchema,
} from "../../schema";

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> => {
  return typeof value === "object" && value !== null;
};

/**
 * 型ガード関数：スキーマがValueSchemaかどうかを判定
 */
export const isValueSchema = (schema: unknown): schema is ValueSchema => {
  return isRecord(schema) && isValueSchemaType(schema.type);
};

/**
 * 型ガード関数：スキーマがSwitchSchemaかどうかを判定
 */
export const isSwitchSchema = (schema: unknown): schema is SwitchSchema => {
  return (
    isRecord(schema) &&
    !("type" in schema) &&
    typeof schema.switch === "string" &&
    Array.isArray(schema.cases) &&
    schema.cases.every(
      (candidate) =>
        isRecord(candidate) &&
        "when" in candidate &&
        isValueSchema(candidate),
    )
  );
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
