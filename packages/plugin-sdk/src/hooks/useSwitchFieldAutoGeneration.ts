import { useEffect, useRef } from "react";

import { isValueSchemaType } from "../schema";
import { DataInitializer } from "../utils/dataInitializer";
import { deepMerge } from "../utils/deepMerge";

import type { RuntimeSwitchSchema, ValueSchema } from "../schema";

const canMergeSwitchValues = (current: unknown, generated: unknown): boolean => {
  if (Array.isArray(current) || Array.isArray(generated)) {
    return Array.isArray(current) && Array.isArray(generated);
  }

  return (
    current !== null &&
    typeof current === "object" &&
    generated !== null &&
    typeof generated === "object"
  );
};

/**
 * カスタムフック: switchフィールドの値変更を検出し、必須フィールドを自動生成する
 * @param switchValue - 現在のswitch値
 * @param switchSchema - switchスキーマ
 * @param data - 現在のデータ
 * @param onDataChange - データ変更コールバック
 */
export function useSwitchFieldAutoGeneration(
  switchValue: any,
  switchSchema: Pick<RuntimeSwitchSchema, "cases"> | null,
  data: any,
  onDataChange: (newData: any) => void,
) {
  const previousSwitchValueRef = useRef<any>(undefined);

  useEffect(() => {
    // switchSchemaがない場合は何もしない
    if (!switchSchema) {
      return;
    }

    // 初回レンダリング時は値を保存するだけ
    if (previousSwitchValueRef.current === undefined) {
      previousSwitchValueRef.current = switchValue;
      return;
    }

    // switch値が変更されたかチェック
    if (previousSwitchValueRef.current !== switchValue) {
      // 新しいcaseを探す
      const newCase = switchSchema.cases?.find((c) => c.when === switchValue);

      if (newCase && isValueSchemaType(newCase.type)) {
        // 新しいcaseの必須フィールドを生成
        const initializer = new DataInitializer([]);
        const requiredFields = initializer.createRequiredValue(
          newCase as ValueSchema,
        );

        // 既存データとマージ
        if (requiredFields !== null && requiredFields !== undefined) {
          const mergedData = canMergeSwitchValues(data, requiredFields)
            ? deepMerge(data, requiredFields)
            : requiredFields;

          // 実際に変更がある場合のみ更新
          if (JSON.stringify(mergedData) !== JSON.stringify(data)) {
            onDataChange(mergedData);
          }
        }
      }

      // 次回比較のために値を更新
      previousSwitchValueRef.current = switchValue;
    }
  }, [switchValue, switchSchema, data, onDataChange]);
}
