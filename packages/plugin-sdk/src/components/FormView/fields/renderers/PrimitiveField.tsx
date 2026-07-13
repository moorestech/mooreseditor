import { memo } from "react";

import { Box, Flex, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";

import { renderPrimitiveInput } from "./renderPrimitiveInput";

import type { PrimitiveFieldProps } from "../fieldTypes";

const PrimitiveField = memo(function PrimitiveField({
  label,
  schema,
  data,
  jsonData,
  onDataChange,
}: PrimitiveFieldProps) {
  const { hovered: isLabelHovered, ref: labelHoverRef } =
    useHover<HTMLDivElement>();

  const labelElement = label ? (
    <Text ref={labelHoverRef} style={{ minWidth: 120 }}>
      {label}
    </Text>
  ) : null;

  return (
    <Flex align="center" gap="md">
      {labelElement}
      <Box style={{ flex: 1 }}>
        {renderPrimitiveInput({
          schema,
          data,
          jsonData,
          onDataChange,
          isParentHovered: isLabelHovered,
        })}
      </Box>
    </Flex>
  );
});

export default PrimitiveField;
