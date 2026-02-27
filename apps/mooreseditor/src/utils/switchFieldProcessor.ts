import { DataInitializer } from "./dataInitializer";
import { deepMerge } from "./deepMerge";

import type { ObjectSchema, SwitchSchema } from "../libs/schema/types";

/**
 * オブジェクトスキーマ内のswitchフィールドを処理し、
 * 必要に応じて必須フィールドを自動生成する
 *
 * @param schema - オブジェクトスキーマ
 * @param originalData - 元のデータ
 * @param updatedData - 更新されたデータ
 * @param changedKey - 変更されたフィールドのキー
 * @returns 必須フィールドが追加された新しいデータ
 */
export function processSwitchFields(
  schema: ObjectSchema,
  originalData: any,
  updatedData: any,
  changedKey: string,
): any {
  if (!schema.properties) {
    return updatedData;
  }

  let processedData = { ...updatedData };

  // スキーマ内のすべてのプロパティをチェック
  for (const property of schema.properties) {
    const { key, ...propSchema } = property;

    // switchスキーマを探す
    if ("switch" in propSchema) {
      const switchSchema = propSchema as SwitchSchema;

      // switchが参照するパスを解析
      const switchPath = switchSchema.switch;

      // 相対パス（./）の場合、現在のレベルのフィールドを参照
      if (switchPath.startsWith("./")) {
        const referencedField = switchPath.slice(2);

        // 変更されたキーがswitchの参照先と一致する場合
        if (referencedField === changedKey) {
          const oldSwitchValue = originalData?.[referencedField];
          const newSwitchValue = updatedData[referencedField];

          // switch値が変更された場合
          if (oldSwitchValue !== newSwitchValue) {
            // 新しいcaseを探す
            const newCase = switchSchema.cases?.find(
              (c) => c.when === newSwitchValue,
            );

            if (newCase && "type" in newCase) {
              // 新しいcaseの必須フィールドを生成
              const initializer = new DataInitializer([]);
              const requiredFields = initializer.createRequiredValue(newCase);

              // 既存のswitchフィールドデータとマージ
              if (requiredFields !== null && requiredFields !== undefined) {
                const existingSwitchData = processedData[key] || {};
                const mergedSwitchData = deepMerge(
                  existingSwitchData,
                  requiredFields,
                );

                // データを更新
                processedData = {
                  ...processedData,
                  [key]: mergedSwitchData,
                };
              }
            }
          }
        }
      }
      // TODO: 他のパスパターン（../、/）もサポートする必要がある場合は実装
    }
  }

  return processedData;
}
