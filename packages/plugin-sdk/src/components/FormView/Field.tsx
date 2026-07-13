import { memo } from "react";

import { Flex, Text } from "@mantine/core";

import { isValueSchemaType } from "../../schema";

import ObjectField from "./ObjectField";
import PrimitiveField from "./PrimitiveField";
import SchemaArrayField from "./SchemaArrayField";
import SwitchField from "./SwitchField";
import {
  isPrimitiveSchema,
  isSwitchSchema,
  isValueSchema,
} from "./fieldHelpers";

import type { FieldProps } from "./fieldTypes";

const renderSchemaError = (label: string, message: string) => (
  <Flex align="center" gap="md">
    {label && <Text style={{ minWidth: 120 }}>{label}</Text>}
    <Text c="red">{message}</Text>
  </Flex>
);

const assertNever = (schema: never): never => {
  throw new Error(`Unhandled schema type: ${JSON.stringify(schema)}`);
};

const Field = memo(function Field(props: FieldProps) {
  const { label, schema } = props;

  if (isSwitchSchema(schema)) {
    return <SwitchField {...props} schema={schema} />;
  }

  const schemaType =
    typeof schema === "object" && schema !== null && "type" in schema
      ? schema.type
      : undefined;

  if (schemaType === undefined) {
    return renderSchemaError(label, "Invalid schema");
  }

  if (!isValueSchema(schema)) {
    return renderSchemaError(
      label,
      isValueSchemaType(schemaType)
        ? "Invalid schema"
        : `Unsupported type: ${String(schemaType)}`,
    );
  }

  if (schema.type === "object") {
    return <ObjectField {...props} schema={schema} />;
  }

  if (schema.type === "array") {
    return <SchemaArrayField {...props} schema={schema} />;
  }

  if (isPrimitiveSchema(schema)) {
    return <PrimitiveField {...props} schema={schema} />;
  }

  return assertNever(schema);
});

export default Field;
