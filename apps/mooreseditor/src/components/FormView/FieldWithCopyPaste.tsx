import React from 'react';

import { Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconCopy, IconClipboard } from '@tabler/icons-react';

import { useCopyPaste } from '../../hooks/useCopyPaste';

import type { Schema } from '../../libs/schema/types';

interface FieldWithCopyPasteProps {
  value: any;
  onChange: (value: any) => void;
  schema: Schema;
  children: React.ReactNode;
}

export const FieldWithCopyPaste: React.FC<FieldWithCopyPasteProps> = ({
  value,
  onChange,
  schema,
  children
}) => {
  const { handleCopy, handlePaste } = useCopyPaste(value, onChange, schema);

  return (
    <Group gap={4} wrap="nowrap" style={{ width: '100%' }}>
      <Tooltip label="値をコピー" withArrow position="top">
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={handleCopy}
          size="sm"
        >
          <IconCopy size={14} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="値をペースト" withArrow position="top">
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={handlePaste}
          size="sm"
        >
          <IconClipboard size={14} />
        </ActionIcon>
      </Tooltip>
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </Group>
  );
};