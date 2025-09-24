import { useCallback } from "react";

import { showNotification } from "../utils/notification";
import { schemaToZod } from "../utils/schemaToZod";

import type { Schema } from "../libs/schema/types";

export function useCopyPaste(
  value: any,
  onChange: (value: any) => void,
  schema: Schema,
) {
  const handleCopy = useCallback(async () => {
    try {
      const json = JSON.stringify({ value, schema: { type: schema } }, null, 2);
      await navigator.clipboard.writeText(json);
      await showNotification(
        "コピー成功",
        "値をクリップボードにコピーしました",
        "success",
      );
    } catch (error) {
      console.error("コピーに失敗しました:", error);
      await showNotification(
        "コピー失敗",
        "クリップボードへの書き込みに失敗しました",
        "error",
      );
    }
  }, [value, schema]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        await showNotification(
          "ペースト失敗",
          "クリップボードが空です",
          "info",
        );
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (_error) {
        await showNotification("ペースト失敗", "無効なJSON形式です", "error");
        return;
      }

      // Extract value from clipboard data
      const dataToValidate = parsed.value !== undefined ? parsed.value : parsed;

      // Convert schema to Zod and validate
      const zodSchema = schemaToZod(schema);
      const validationResult = zodSchema.safeParse(dataToValidate);

      if (validationResult.success) {
        onChange(validationResult.data);
        await showNotification("ペースト成功", "値を貼り付けました", "success");
      } else {
        const firstError = validationResult.error.errors[0];
        const errorMessage = firstError?.message || "不明なエラー";
        const errorPath = firstError?.path?.join(".") || "";
        const fullMessage = errorPath
          ? `${errorPath}: ${errorMessage}`
          : errorMessage;
        await showNotification(
          "スキーマエラー",
          `値がスキーマに一致しません: ${fullMessage}`,
          "error",
        );
      }
    } catch (error) {
      console.error("ペースト処理に失敗しました:", error);
      await showNotification(
        "ペースト失敗",
        "ペースト処理中にエラーが発生しました",
        "error",
      );
    }
  }, [onChange, schema]);

  return { handleCopy, handlePaste };
}
