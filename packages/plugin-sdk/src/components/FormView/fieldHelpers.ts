import {
  isPrimitiveSchemaType,
  isRuntimeSwitchSchema,
  isRuntimeValueSchema,
} from "../../schema";

import type {
  ArraySchema,
  ObjectSchema,
  PrimitiveSchema,
  RuntimeSwitchSchema,
  ValueSchema,
} from "../../schema";

export const isValueSchema = (schema: unknown): schema is ValueSchema => {
  return isRuntimeValueSchema(schema);
};

/**
 * 型ガード関数：スキーマがSwitchSchemaかどうかを判定
 */
export const isSwitchSchema = (
  schema: unknown,
): schema is RuntimeSwitchSchema => {
  return isRuntimeSwitchSchema(schema);
};

export const isPrimitiveSchema = (
  schema: unknown,
): schema is PrimitiveSchema => {
  return isRuntimeValueSchema(schema) && isPrimitiveSchemaType(schema.type);
};

/**
 * 型ガード関数：スキーマがオブジェクト配列かどうかを判定
 */
export const isObjectArraySchema = (
  schema: ArraySchema,
): schema is ArraySchema & { items: ObjectSchema } => {
  return isValueSchema(schema.items) && schema.items.type === "object";
};
