import { useCallback, useMemo } from "react";

import { useCopyPaste } from "../../../hooks/useCopyPaste";

import type { Schema, ObjectSchema, ValueSchema } from "../../../libs/schema/types";

interface UseClipboardAppendOptions {
  schemaItems?: Schema | ValueSchema;
  arrayData: any[];
  onDataChange?: (value: any[]) => void;
}

export function useClipboardAppend({
  schemaItems,
  arrayData,
  onDataChange,
}: UseClipboardAppendOptions) {
  const objectItemSchema = useMemo(() => {
    if (!schemaItems || !("type" in schemaItems)) {
      return undefined;
    }

    return schemaItems.type === "object"
      ? (schemaItems as ObjectSchema)
      : undefined;
  }, [schemaItems]);

  const handleAppendFromClipboard = useCallback(
    (newValue: any) => {
      if (!onDataChange) {
        return;
      }

      const newArray = [...arrayData];
      newArray.push(newValue);
      onDataChange(newArray);
    },
    [arrayData, onDataChange],
  );

  const { handlePaste: handlePasteNewItem } = useCopyPaste(
    null,
    handleAppendFromClipboard,
    (objectItemSchema ?? { type: "object" }) as Schema,
  );

  return { objectItemSchema, handlePasteNewItem };
}
