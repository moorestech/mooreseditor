import React, { memo } from "react";

import { Text } from "@mantine/core";

import { FieldWithCopyPaste } from "./FieldWithCopyPaste";

import type { ObjectFieldProps } from "./fieldTypes";

const FormViewLazy = React.lazy(() => import("./index"));

const ObjectField = memo(function ObjectField({
  label,
  schema,
  data,
  jsonData,
  onDataChange,
  onObjectArrayClick,
  path,
  parentData,
  rootData,
  arrayIndices,
}: ObjectFieldProps) {
  const formView = (
    <React.Suspense fallback={<Text c="dimmed">Loading...</Text>}>
      <FormViewLazy
        schema={schema}
        data={data}
        jsonData={jsonData}
        onDataChange={onDataChange}
        onObjectArrayClick={onObjectArrayClick}
        path={path}
        parentData={parentData}
        rootData={rootData}
        arrayIndices={arrayIndices}
      />
    </React.Suspense>
  );

  if (!label) {
    return formView;
  }

  return (
    <FieldWithCopyPaste
      value={data}
      onChange={onDataChange}
      schema={schema}
      collapsible={true}
      label={label}
      defaultExpanded={true}
    >
      {formView}
    </FieldWithCopyPaste>
  );
});

export default ObjectField;
