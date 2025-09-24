import React, { useState, useCallback } from "react";

import { Group, Box, Flex, Collapse, ActionIcon } from "@mantine/core";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

import { CopyPasteButtons } from "./CopyPasteButtons";

import type { Schema } from "@/libs/schema/types";
import type { JsonValue } from "@/types/json";

import { useCopyPaste } from "@/hooks/useCopyPaste";

interface FieldWithCopyPasteProps {
  value: JsonValue;
  onChange: (value: JsonValue) => void;
  schema: Schema;
  children: React.ReactNode;
  // Collapsible options
  collapsible?: boolean;
  label?: string;
  defaultExpanded?: boolean;
  isParentHovered?: boolean;
}

export const FieldWithCopyPaste: React.FC<FieldWithCopyPasteProps> = ({
  value,
  onChange,
  schema,
  children,
  collapsible = false,
  label,
  defaultExpanded = true,
  isParentHovered = false,
}) => {
  const { handleCopy, handlePaste } = useCopyPaste(value, onChange, schema);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isActive, setIsActive] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const showButtons = () => {
    setIsActive(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    const nextFocus = event.relatedTarget as Node | null;
    if (nextFocus && event.currentTarget.contains(nextFocus)) {
      return;
    }
    setIsActive(false);
  };

  const handleMouseLeave = () => {
    setIsActive(false);
  };

  const isButtonsVisible = isParentHovered || isActive;
  const buttonGroupStyle: React.CSSProperties = {
    display: "inline-flex",
    opacity: isButtonsVisible ? 1 : 0,
    visibility: isButtonsVisible ? "visible" : "hidden",
    pointerEvents: isButtonsVisible ? "auto" : "none",
    transition: "opacity 150ms ease",
  };

  if (collapsible && label) {
    return (
      <Box>
        <Flex
          align="center"
          gap="xs"
          onMouseEnter={showButtons}
          onMouseLeave={handleMouseLeave}
          onFocusCapture={showButtons}
          onBlurCapture={handleBlur}
        >
          <ActionIcon variant="subtle" size="sm" onClick={toggleExpanded}>
            {isExpanded ? (
              <IconChevronDown size={16} />
            ) : (
              <IconChevronRight size={16} />
            )}
          </ActionIcon>
          <Box
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={toggleExpanded}
          >
            {label}
          </Box>
          <Group gap={4} wrap="nowrap" style={buttonGroupStyle}>
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

  return (
    <Group
      gap={4}
      wrap="nowrap"
      align="flex-start"
      style={{ width: "100%" }}
      onMouseEnter={showButtons}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={showButtons}
      onBlurCapture={handleBlur}
    >
      <Box style={buttonGroupStyle}>
        <CopyPasteButtons onCopy={handleCopy} onPaste={handlePaste} />
      </Box>
      <div style={{ flex: 1 }}>{children}</div>
    </Group>
  );
};
