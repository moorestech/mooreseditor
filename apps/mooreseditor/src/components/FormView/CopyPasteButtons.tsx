import React from "react";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconCopy, IconClipboard } from "@tabler/icons-react";

interface CopyPasteButtonsProps {
  onCopy: () => void;
  onPaste: () => void;
}

export const CopyPasteButtons: React.FC<CopyPasteButtonsProps> = ({
  onCopy,
  onPaste,
}) => {
  return (
    <>
      <Tooltip label="値をコピー" withArrow position="top">
        <ActionIcon variant="subtle" color="gray" onClick={onCopy} size="sm">
          <IconCopy size={14} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="値をペースト" withArrow position="top">
        <ActionIcon variant="subtle" color="gray" onClick={onPaste} size="sm">
          <IconClipboard size={14} />
        </ActionIcon>
      </Tooltip>
    </>
  );
};
