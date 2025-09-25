import React, { useCallback, useEffect, useRef } from "react";

import { Stack } from "@mantine/core";

import Field from "./Field";

import type { Column } from "../../hooks/useJson";
import type {
  Schema,
  ObjectSchema,
  ArraySchema,
} from "../../libs/schema/types";

interface FormViewProps {
  schema: Schema;
  data: any;
  jsonData?: Column[];
  onDataChange: (newData: any) => void;
  onObjectArrayClick?: (path: string[], schema: Schema) => void;
  path?: string[];
  parentData?: any;
  rootData?: any;
  arrayIndices?: Map<string, number>;
}

const FormView = ({
  schema,
  data,
  jsonData,
  onDataChange,
  onObjectArrayClick,
  path = [],
  parentData,
  rootData,
  arrayIndices,
}: FormViewProps) => {
  const hasAutoOpenedRef = useRef(false);

  // Always treat the top-level as an object
  const handlePropertyChange = useCallback(
    (key: string, value: any) => {
      onDataChange({
        ...data,
        [key]: value,
      });
    },
    [data, onDataChange],
  );

  // Auto-open object arrays with openedByDefault - only on first mount
  useEffect(() => {
    if (
      !hasAutoOpenedRef.current &&
      "type" in schema &&
      schema.type === "object" &&
      onObjectArrayClick
    ) {
      hasAutoOpenedRef.current = true;
      const objSchema = schema as ObjectSchema;
      objSchema.properties?.forEach((property) => {
        const propertyKey = property.key;
        const { key, ...propertySchema } = property;

        // Check if this is an array of objects with openedByDefault
        if ("type" in propertySchema && propertySchema.type === "array") {
          const arraySchema = propertySchema as ArraySchema;
          if (
            arraySchema.openedByDefault &&
            arraySchema.items &&
            "type" in arraySchema.items &&
            arraySchema.items.type === "object"
          ) {
            // Trigger the onObjectArrayClick for this path
            onObjectArrayClick(
              [...path, propertyKey],
              propertySchema as Schema,
            );
          }
        }
      });
    }
  }, [schema, path, onObjectArrayClick]);

  // Handle the case where schema is an object
  if ("type" in schema && schema.type === "object") {
    const objSchema = schema as ObjectSchema;
    return (
      <Stack gap="sm">
        {objSchema.properties?.map((property) => {
          const propertyKey = property.key;
          const { key, ...propertySchema } = property;

          return (
            <Field
              key={propertyKey}
              label={propertyKey}
              schema={propertySchema as Schema}
              data={data?.[propertyKey]}
              jsonData={jsonData}
              onDataChange={(value) => handlePropertyChange(propertyKey, value)}
              onObjectArrayClick={onObjectArrayClick}
              path={[...path, propertyKey]}
              parentData={data}
              rootData={rootData || data}
              arrayIndices={arrayIndices}
            />
          );
        })}
      </Stack>
    );
  }

  // For non-object schemas at the root level, wrap in a simple object structure
  return (
    <Field
      label=""
      schema={schema}
      data={data}
      jsonData={jsonData}
      onDataChange={onDataChange}
      onObjectArrayClick={onObjectArrayClick}
      path={path}
      parentData={parentData}
      rootData={rootData || data}
      arrayIndices={arrayIndices}
    />
  );
};

export default FormView;
