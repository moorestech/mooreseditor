import { isRuntimeValueSchema } from "../schema";

import { calculateAutoIncrement } from "./autoIncrement";
import { DataInitializer } from "./dataInitializer";
import { createPrimitiveDefaultValue } from "./primitiveDefaultValue";

import type { Schema, ValueSchema } from "../schema";

/**
 * プライベート関数：基本的なデフォルト値を生成
 */
const getDefaultValue = (itemSchema: ValueSchema): any => {
  if (itemSchema.type === "object") {
    const obj: any = {};
    if (itemSchema.properties) {
      itemSchema.properties.forEach((prop) => {
        const { key, ...propSchema } = prop;
        if ("type" in propSchema) {
          obj[key] = getDefaultValue(propSchema as ValueSchema);
        }
      });
    }
    return obj;
  }

  if (itemSchema.type === "array") {
    return [];
  }

  return createPrimitiveDefaultValue(itemSchema);
};

/**
 * スキーマに基づいて初期値を生成する関数
 * 必須フィールドのみを生成し、オプショナルフィールドは生成しない
 * autoIncrementオプションが設定されている場合は、既存データから適切な値を計算
 *
 * @param schema - 値を生成するためのスキーマ
 * @param existingData - autoIncrement計算のための既存データ配列（オプション）
 * @param useOnlyRequired - 必須フィールドのみを生成するかどうか（デフォルト: true）
 * @returns 生成された初期値
 */
export function createInitialValue(
  schema: Schema | ValueSchema,
  existingData: any[] = [],
  useOnlyRequired: boolean = true,
): any {
  // 必須フィールドのみを生成する場合はDataInitializerを使用
  if (useOnlyRequired) {
    const initializer = new DataInitializer(existingData);
    return initializer.createRequiredValue(schema);
  }

  // 後方互換性のため、旧実装も残す（全フィールドを生成）
  // スキーマがない場合はnullを返す
  if (!isRuntimeValueSchema(schema)) {
    return null;
  }

  // 基本的なデフォルト値を取得
  let defaultValue = getDefaultValue(schema);

  // オブジェクト型の場合、autoIncrementプロパティをチェック
  if (
    schema.type === "object" &&
    schema.properties &&
    Array.isArray(existingData)
  ) {
    const obj = { ...defaultValue };

    schema.properties.forEach((prop) => {
      const { key, ...propSchema } = prop;

      // integer型またはnumber型でautoIncrementが設定されている場合
      if (
        "type" in propSchema &&
        (propSchema.type === "integer" || propSchema.type === "number") &&
        propSchema.autoIncrement
      ) {
        // 既存の配列データから自動インクリメント値を計算
        obj[key] = calculateAutoIncrement(
          existingData,
          key,
          propSchema.autoIncrement,
        );
      }
    });

    defaultValue = obj;
  }

  return defaultValue;
}
