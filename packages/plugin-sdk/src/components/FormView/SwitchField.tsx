import { memo } from "react";

import { useSwitchFieldAutoGeneration } from "../../hooks/useSwitchFieldAutoGeneration";
import { resolvePath } from "../../utils/pathResolver";

import Field from "./Field";

import type { SwitchFieldProps } from "./fieldTypes";

const SwitchField = memo(function SwitchField({
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
}: SwitchFieldProps) {
  const switchValue = resolvePath(
    schema.switch,
    path,
    rootData || data,
    arrayIndices,
  );

  useSwitchFieldAutoGeneration(switchValue, schema, data, onDataChange);

  const matchingCase = schema.cases?.find(
    (candidate) => candidate.when === switchValue,
  );

  if (!matchingCase) {
    return null;
  }

  return (
    <Field
      key={`${typeof switchValue}:${String(switchValue)}`}
      label={label}
      schema={matchingCase}
      data={data}
      jsonData={jsonData}
      onDataChange={onDataChange}
      onObjectArrayClick={onObjectArrayClick}
      path={path}
      parentData={parentData}
      rootData={rootData}
      arrayIndices={arrayIndices}
    />
  );
});

export default SwitchField;
