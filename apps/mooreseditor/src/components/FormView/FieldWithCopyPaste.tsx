import React, { useState, useCallback } from 'react';

import { Group, ActionIcon, Tooltip, Box, Flex, Collapse } from '@mantine/core';
import { IconCopy, IconClipboard, IconChevronDown, IconChevronRight } from '@tabler/icons-react';

import { useCopyPaste } from '../../hooks/useCopyPaste';

import type { Schema } from '../../libs/schema/types';

interface FieldWithCopyPasteProps {
  value: any;
  onChange: (value: any) => void;
  schema: Schema;
  children: React.ReactNode;
  // Collapsible options
  collapsible?: boolean;
  label?: string;
  defaultExpanded?: boolean;
}

export const FieldWithCopyPaste: React.FC<FieldWithCopyPasteProps> = ({
  value,
  onChange,
  schema,
  children,
  collapsible = false,
  label,
  defaultExpanded = true
}) => {
  const { handleCopy, handlePaste } = useCopyPaste(value, onChange, schema);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Copy/Paste buttons component
  const CopyPasteButtons = () => (
    <>
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
    </>
  );

  // Collapsible mode
  if (collapsible && label) {
    return (
      <Box>
        <Flex align="center" gap="xs">
          <Group gap={4}>
            <CopyPasteButtons />
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={toggleExpanded}
            >
              {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            </ActionIcon>
          </Group>
          <Box
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={toggleExpanded}
          >
            {label}
          </Box>
        </Flex>
        <Collapse in={isExpanded}>
          <Box pl="md" mt="xs">
            {children}
          </Box>
        </Collapse>
      </Box>
    );
  }

  // Non-collapsible mode (original behavior)
  return (
    <Group gap={4} wrap="nowrap" style={{ width: '100%' }}>
      <CopyPasteButtons />
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </Group>
  );
};