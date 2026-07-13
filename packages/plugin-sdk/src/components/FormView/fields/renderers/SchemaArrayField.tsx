import { memo, useCallback } from "react";

import { Box, Button, Flex, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";

import ArrayField from "../../ArrayField";
import { FieldWithCopyPaste } from "../../FieldWithCopyPaste";
import { isObjectArraySchema } from "../fieldHelpers";

import type { SchemaArrayFieldProps } from "../fieldTypes";

const SchemaArrayField = memo(function SchemaArrayField({
  label,
  schema,
  data,
  jsonData,
  onDataChange,
  onObjectArrayClick,
  path,
  rootData,
  arrayIndices,
}: SchemaArrayFieldProps) {
  const { hovered: isLabelHovered, ref: labelHoverRef } =
    useHover<HTMLDivElement>();

  const handleObjectArrayClick = useCallback(() => {
    onObjectArrayClick?.(path, schema);
  }, [onObjectArrayClick, path, schema]);

  const labelElement = label ? (
    <Text ref={labelHoverRef} style={{ minWidth: 120 }}>
      {label}
    </Text>
  ) : null;

  if (isObjectArraySchema(schema)) {
    return (
      <Flex align="center" gap="md">
        {labelElement}
        <FieldWithCopyPaste
          value={data}
          onChange={onDataChange}
          schema={schema}
          isParentHovered={isLabelHovered}
        >
          <Button onClick={handleObjectArrayClick} variant="light">
            Edit {label}
          </Button>
        </FieldWithCopyPaste>
      </Flex>
    );
  }

  return (
    <Flex align="flex-start" gap="md">
      {labelElement}
      <Box style={{ flex: 1 }}>
        <FieldWithCopyPaste
          value={data}
          onChange={onDataChange}
          schema={schema}
          isParentHovered={isLabelHovered}
        >
          <ArrayField
            schema={schema}
            data={data}
            jsonData={jsonData}
            onDataChange={onDataChange}
            onObjectArrayClick={onObjectArrayClick}
            path={path}
            rootData={rootData}
            arrayIndices={arrayIndices}
          />
        </FieldWithCopyPaste>
      </Box>
    </Flex>
  );
});

export default SchemaArrayField;
