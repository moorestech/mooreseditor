import React, { useState } from 'react';

import { Box, Flex, ActionIcon, Collapse } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

interface CollapsibleObjectProps {
    label: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

function CollapsibleObject({ label, children, defaultExpanded = false }: CollapsibleObjectProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <Box>
            <Flex align="center" gap="xs">
                <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                </ActionIcon>
                <Box
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => setIsExpanded(!isExpanded)}
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

export default CollapsibleObject;