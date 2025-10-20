import React, { useCallback } from "react";

import { Group } from "@mantine/core";

import { useCopyPaste } from "../../../hooks/useCopyPaste";
import { processSwitchFields } from "../../../utils/switchFieldProcessor";
import { CopyPasteButtons } from "../../FormView/CopyPasteButtons";

import type { ObjectSchema, Schema } from "../../../libs/schema/types";

interface RowCopyPasteButtonsProps {
  row: any;
  index: number;
  arrayData: any[];
  itemSchema?: ObjectSchema;
  onDataChange?: (newData: any[]) => void;
}

export const RowCopyPasteButtons: React.FC<RowCopyPasteButtonsProps> = ({
  row,
  index,
  arrayData,
  itemSchema,
  onDataChange,
}) => {
  const handleRowReplace = useCallback(
    (newValue: any) => {
      if (!onDataChange) {
        return;
      }

      const newData = [...arrayData];
      const currentRow = newData[index];

      const processedRow =
        itemSchema && currentRow
          ? processSwitchFields(itemSchema, currentRow, newValue, "")
          : newValue;

      newData[index] = processedRow;
      onDataChange(newData);
    },
    [arrayData, index, itemSchema, onDataChange],
  );

  const { handleCopy, handlePaste } = useCopyPaste(
    row,
    handleRowReplace,
    (itemSchema ?? { type: "object" }) as Schema,
  );

  const handleCopyClick = useCallback(() => {
    void handleCopy();
  }, [handleCopy]);

  const handlePasteClick = useCallback(() => {
    void handlePaste();
  }, [handlePaste]);

  if (!itemSchema || !onDataChange) {
    return null;
  }

  return (
    <div
      onClick={(event: React.MouseEvent<HTMLDivElement>) =>
        event.stopPropagation()
      }
      onMouseDown={(event: React.MouseEvent<HTMLDivElement>) =>
        event.stopPropagation()
      }
    >
      <Group gap={4} wrap="nowrap">
        <CopyPasteButtons
          onCopy={handleCopyClick}
          onPaste={handlePasteClick}
        />
      </Group>
    </div>
  );
};
