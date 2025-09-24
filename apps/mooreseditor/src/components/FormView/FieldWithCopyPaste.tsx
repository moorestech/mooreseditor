import React, { useState, useCallback } from 'react';

import { Group, Box, Flex, Collapse, ActionIcon } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

import { CopyPasteButtons } from './CopyPasteButtons';


import type { Schema } from '@/libs/schema/types';
import type { JsonValue } from '@/types/json';

import { useCopyPaste } from '@/hooks/useCopyPaste';

interface FieldWithCopyPasteProps {
  value: JsonValue;
  onChange: (value: JsonValue) => void;
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

  // Collapsible mode
  if (collapsible && label) {
    return (
      <Box>
        <Flex align="center" gap="xs">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={toggleExpanded}
          >
            {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </ActionIcon>
          <Box
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={toggleExpanded}
          >
            {label}
          </Box>
          <Group gap={4} wrap="nowrap">
            <CopyPasteButtons onCopy={handleCopy} onPaste={handlePaste} />
          </Group>
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
      <CopyPasteButtons onCopy={handleCopy} onPaste={handlePaste} />
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </Group>
  );
};
