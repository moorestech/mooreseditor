import type { Schema, ValueSchema, SwitchSchema } from "@/libs/schema/types";

/**
 * 型ガード関数：スキーマがSwitchSchemaかどうかを判定
 */
export const isSwitchSchema = (schema: Schema): schema is SwitchSchema => {
  return "switch" in schema;
};

/**
 * 型ガード関数：スキーマがValueSchemaかどうかを判定
 */
export const isValueSchema = (schema: Schema): schema is ValueSchema => {
  return "type" in schema;
};

/**
 * 型ガード関数：スキーマがオブジェクト配列かどうかを判定
 */
export const isObjectArraySchema = (schema: Schema): boolean => {
  if (!isValueSchema(schema)) return false;
  if (schema.type !== "array") return false;
  if (!schema.items) return false;
  if (!("type" in schema.items)) return false;
  return schema.items.type === "object";
};
