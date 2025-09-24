import React from "react";

import { Text } from "@mantine/core";

import { FieldWithCopyPaste } from "./FieldWithCopyPaste";
import {
  StringInput,
  UuidInput,
  EnumInput,
  IntegerInput,
  NumberInput,
  BooleanInput,
  Vector2Input,
  Vector3Input,
  Vector4Input,
} from "./inputs";

import type { Column } from "@/hooks/useJson";
import type { ValueSchema } from "@/libs/schema/types";

interface RenderPrimitiveInputProps {
  schema: ValueSchema;
  data: any;
  jsonData?: Column[];
  onDataChange: (value: any) => void;
  isParentHovered?: boolean;
}

export const renderPrimitiveInput = ({
  schema,
  data,
  jsonData,
  onDataChange,
  isParentHovered = false,
}: RenderPrimitiveInputProps): React.ReactElement => {
  const renderInput = () => {
    switch (schema.type) {
      case "string":
        return (
          <StringInput
            value={data}
            onChange={onDataChange}
            schema={schema}
            jsonData={jsonData}
          />
        );
      case "uuid":
        return (
          <UuidInput
            value={data}
            onChange={onDataChange}
            schema={schema}
            jsonData={jsonData}
          />
        );
      case "enum":
        return (
          <EnumInput
            value={data}
            onChange={onDataChange}
            schema={schema}
            jsonData={jsonData}
          />
        );
      case "integer":
        return (
          <IntegerInput
            value={data}
            onChange={onDataChange}
            schema={schema}
            jsonData={jsonData}
          />
        );
      case "number":
        return (
          <NumberInput
            value={data}
            onChange={onDataChange}
            schema={schema}
            jsonData={jsonData}
          />
        );
      case "boolean":
        return (
          <BooleanInput
            value={data}
            onChange={onDataChange}
            schema={schema}
            jsonData={jsonData}
          />
        );
      case "vector2":
      case "vector2Int":
        return (
          <Vector2Input
            value={data}
            onChange={onDataChange}
            schema={schema}
            jsonData={jsonData}
          />
        );
      case "vector3":
      case "vector3Int":
        return (
          <Vector3Input
            value={data}
            onChange={onDataChange}
            schema={schema}
            jsonData={jsonData}
          />
        );
      case "vector4":
      case "vector4Int":
        return (
          <Vector4Input
            value={data}
            onChange={onDataChange}
            schema={schema}
            jsonData={jsonData}
          />
        );
      default:
        return (
          <Text c="dimmed" size="sm">
            Unsupported type: {schema.type}
          </Text>
        );
    }
  };

  const input = renderInput();

  // Wrap with copy/paste buttons for all valid types
  if (schema.type) {
    return (
      <FieldWithCopyPaste
        value={data}
        onChange={onDataChange}
        schema={schema}
        isParentHovered={isParentHovered}
      >
        {input}
      </FieldWithCopyPaste>
    );
  }

  return input;
};
