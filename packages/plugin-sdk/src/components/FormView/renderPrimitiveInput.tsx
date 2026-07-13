import type { ReactElement } from "react";

import { FieldWithCopyPaste } from "./FieldWithCopyPaste";
import {
  BooleanInput,
  EnumInput,
  IntegerInput,
  NumberInput,
  StringInput,
  UuidInput,
  Vector2Input,
  Vector3Input,
  Vector4Input,
} from "./inputs";

import type { Column, PrimitiveSchema } from "../../schema";

interface RenderPrimitiveInputProps {
  schema: PrimitiveSchema;
  data: any;
  jsonData?: Column[];
  onDataChange: (value: any) => void;
  isParentHovered?: boolean;
}

type PrimitiveInputRenderer = (
  props: RenderPrimitiveInputProps,
) => ReactElement;

type PrimitiveInputRendererRegistry = {
  [Type in PrimitiveSchema["type"]]: PrimitiveInputRenderer;
};

const renderStringInput: PrimitiveInputRenderer = (props) => (
  <StringInput
    value={props.data}
    onChange={props.onDataChange}
    schema={props.schema}
    jsonData={props.jsonData}
  />
);

const renderUuidInput: PrimitiveInputRenderer = (props) => (
  <UuidInput
    value={props.data}
    onChange={props.onDataChange}
    schema={props.schema}
    jsonData={props.jsonData}
  />
);

const renderEnumInput: PrimitiveInputRenderer = (props) => (
  <EnumInput
    value={props.data}
    onChange={props.onDataChange}
    schema={props.schema}
    jsonData={props.jsonData}
  />
);

const renderIntegerInput: PrimitiveInputRenderer = (props) => (
  <IntegerInput
    value={props.data}
    onChange={props.onDataChange}
    schema={props.schema}
    jsonData={props.jsonData}
  />
);

const renderNumberInput: PrimitiveInputRenderer = (props) => (
  <NumberInput
    value={props.data}
    onChange={props.onDataChange}
    schema={props.schema}
    jsonData={props.jsonData}
  />
);

const renderBooleanInput: PrimitiveInputRenderer = (props) => (
  <BooleanInput
    value={props.data}
    onChange={props.onDataChange}
    schema={props.schema}
    jsonData={props.jsonData}
  />
);

const renderVector2Input: PrimitiveInputRenderer = (props) => (
  <Vector2Input
    value={props.data}
    onChange={props.onDataChange}
    schema={props.schema}
    jsonData={props.jsonData}
  />
);

const renderVector3Input: PrimitiveInputRenderer = (props) => (
  <Vector3Input
    value={props.data}
    onChange={props.onDataChange}
    schema={props.schema}
    jsonData={props.jsonData}
  />
);

const renderVector4Input: PrimitiveInputRenderer = (props) => (
  <Vector4Input
    value={props.data}
    onChange={props.onDataChange}
    schema={props.schema}
    jsonData={props.jsonData}
  />
);

export const primitiveInputRenderers = {
  string: renderStringInput,
  enum: renderEnumInput,
  uuid: renderUuidInput,
  integer: renderIntegerInput,
  number: renderNumberInput,
  boolean: renderBooleanInput,
  vector2: renderVector2Input,
  vector3: renderVector3Input,
  vector4: renderVector4Input,
  vector2Int: renderVector2Input,
  vector3Int: renderVector3Input,
  vector4Int: renderVector4Input,
} satisfies PrimitiveInputRendererRegistry;

export const renderPrimitiveInput = ({
  schema,
  data,
  jsonData,
  onDataChange,
  isParentHovered = false,
}: RenderPrimitiveInputProps): ReactElement => {
  const input = primitiveInputRenderers[schema.type]({
    schema,
    data,
    jsonData,
    onDataChange,
    isParentHovered,
  });

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
};
