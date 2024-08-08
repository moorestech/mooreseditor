import { DataSchema } from "~/schema";
import {useOutletContext} from "@remix-run/react";
import {useForeignKeySystem} from "~/hooks/useForeignKeySystem";
import {useEditorContext} from "~/hooks/useEditorContext";

interface Props {
  schema: DataSchema;
  value: unknown;
}

export function Value({
  schema,
  value
}: Props) {

  const { context } = useOutletContext<{ context: ReturnType<typeof useEditorContext> }>()
  const foreignKeySystem = context.foreignKeySystem;

  if ('foreignKey' in schema) {
    value = foreignKeySystem.getForeignValue(schema.foreignKey, value);
  }

  switch(schema.type){
    case 'string':
    case 'number':
    case 'integer':
      return <>{value}</>
    case 'boolean':
      return <>{value ? "✔" : "❎️"}</>
    case 'array':
      return <>{value instanceof Array && value.join(',')}</>
  }
}
