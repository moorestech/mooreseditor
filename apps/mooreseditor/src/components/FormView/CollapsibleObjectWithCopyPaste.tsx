import React, { useState, memo, useCallback } from 'react';

import { Box, Flex, ActionIcon, Collapse, Group, Tooltip } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconCopy, IconClipboard } from '@tabler/icons-react';

import { useCopyPaste } from '../../hooks/useCopyPaste';

import type { Schema } from '../../libs/schema/types';

interface CollapsibleObjectWithCopyPasteProps {
    label: string;
    value: any;
    onChange: (value: any) => void;
    schema: Schema;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

const CollapsibleObjectWithCopyPaste = memo(function CollapsibleObjectWithCopyPaste({
    label,
    value,
    onChange,
    schema,
    children,
    defaultExpanded = false
}: CollapsibleObjectWithCopyPasteProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const { handleCopy, handlePaste } = useCopyPaste(value, onChange, schema);

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    return (
        <Box>
            <Flex align="center" gap="xs">
                <Group gap={4}>
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
});

export default CollapsibleObjectWithCopyPaste;