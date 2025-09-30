import { DataInitializer } from "./dataInitializer";
import { deepMerge } from "./deepMerge";

import type {
  Schema,
  ValueSchema,
  ObjectSchema,
  SchemaContainer,
  SwitchSchema,
} from "../libs/schema/types";

/**
 * 既存データをスキーマに基づいて検証し、不足している必須フィールドを補完します
 * @param existingData 検証・補完対象のデータ
 * @param schema スキーマ
 * @param existingArray 既存の配列データ（autoIncrementのため）
 * @returns { data: 補完後のデータ, addedFields: 追加されたフィールドのパスの配列 }
 */
export function validateAndFillMissingFields(
  existingData: any,
  schema: Schema | ValueSchema | SchemaContainer,
  existingArray?: any[],
): { data: any; addedFields: string[] } {
  // スキーマがない場合は既存データをそのまま返す
  if (!schema || typeof schema !== "object") {
    return { data: existingData, addedFields: [] };
  }

  // DataInitializerで必須フィールドのデフォルト構造を生成
  const initializer = new DataInitializer(existingArray || []);
  const requiredDefaults = initializer.createRequiredValue(schema);

  // deepMergeで既存データに不足フィールドを補完
  // 引数順序: (既存データ, デフォルト値) -> 既存データを優先し、不足分を補完
  const mergedData = deepMerge(existingData, requiredDefaults);

  // 追加されたフィールドを検出
  const addedFields = findAddedFields(existingData, mergedData);

  // オブジェクト内のネストした配列・オブジェクトも再帰的に検証
  if (
    typeof mergedData === "object" &&
    mergedData !== null &&
    !Array.isArray(mergedData) &&
    "type" in schema &&
    schema.type === "object"
  ) {
    const objectSchema = schema as ObjectSchema;
    if (objectSchema.properties) {
      const allAddedFields = [...addedFields];

      objectSchema.properties.forEach((prop) => {
        const { key, ...propSchema } = prop;
        if (key in mergedData && propSchema) {
          // 配列の場合、各要素を再帰的に検証
          if ("type" in propSchema && propSchema.type === "array") {
            const arrayData = mergedData[key];
            if (Array.isArray(arrayData) && "items" in propSchema && propSchema.items) {
              for (let i = 0; i < arrayData.length; i++) {
                const { data: validatedItem, addedFields: itemAddedFields } =
                  validateAndFillMissingFields(
                    arrayData[i],
                    propSchema.items as ValueSchema,
                    arrayData,
                  );
                arrayData[i] = validatedItem;

                // 配列要素内で追加されたフィールドのパスを記録
                itemAddedFields.forEach((field) => {
                  allAddedFields.push(`${key}[${i}].${field}`);
                });
              }
            }
          }
          // ネストしたオブジェクトの場合、再帰的に検証
          else if ("type" in propSchema && propSchema.type === "object") {
            const { data: validatedValue, addedFields: nestedAddedFields } =
              validateAndFillMissingFields(
                mergedData[key],
                propSchema as ValueSchema,
                undefined,
              );
            mergedData[key] = validatedValue;

            // ネストしたフィールド内で追加されたフィールドのパスを記録
            nestedAddedFields.forEach((field) => {
              allAddedFields.push(`${key}.${field}`);
            });
          }
          // Switch fieldの場合、switch値に基づいて適切なcaseのスキーマを取得して検証
          else if ("switch" in propSchema) {
            const switchSchema = propSchema as SwitchSchema;
            const switchPath = switchSchema.switch;

            // 相対パス（./）の場合、現在のレベルのフィールドを参照
            if (switchPath.startsWith("./")) {
              const referencedField = switchPath.slice(2);
              const switchValue = mergedData[referencedField];

              // 一致するcaseを見つける
              const matchedCase = switchSchema.cases?.find(
                (c) => c.when === switchValue,
              );

              if (matchedCase && "type" in matchedCase) {
                // そのcaseのスキーマに対して再帰的に検証
                const { data: validatedValue, addedFields: nestedAddedFields } =
                  validateAndFillMissingFields(
                    mergedData[key],
                    matchedCase as ValueSchema,
                    undefined,
                  );
                mergedData[key] = validatedValue;

                // Switch field内で追加されたフィールドのパスを記録
                nestedAddedFields.forEach((field) => {
                  allAddedFields.push(`${key}.${field}`);
                });
              }
            }
          }
        }
      });

      return { data: mergedData, addedFields: allAddedFields };
    }
  }

  return { data: mergedData, addedFields };
}

/**
 * 追加されたフィールドのパスを検出
 * @param original 元のデータ
 * @param merged マージ後のデータ
 * @param path 現在のパス（再帰用）
 * @returns 追加されたフィールドのパスの配列
 */
function findAddedFields(
  original: any,
  merged: any,
  path: string = "",
): string[] {
  const added: string[] = [];

  // 元のデータが存在しない場合、全体が追加されたと見なす
  if (original === undefined || original === null) {
    if (merged !== undefined && merged !== null) {
      // パスが空の場合はルートレベルの追加
      return path ? [path] : ["(root)"];
    }
    return [];
  }

  // マージ後のデータがオブジェクトの場合
  if (
    typeof merged === "object" &&
    merged !== null &&
    !Array.isArray(merged)
  ) {
    for (const key in merged) {
      const newPath = path ? `${path}.${key}` : key;

      // 元のデータにキーが存在しない場合
      if (!(key in original)) {
        added.push(newPath);
      } else if (
        typeof merged[key] === "object" &&
        merged[key] !== null &&
        !Array.isArray(merged[key]) &&
        typeof original[key] === "object" &&
        original[key] !== null &&
        !Array.isArray(original[key])
      ) {
        // ネストしたオブジェクトの場合、再帰的に検出
        const nestedAdded = findAddedFields(original[key], merged[key], newPath);
        added.push(...nestedAdded);
      }
    }
  }

  return added;
}