import { DataSchema } from "~/schema";
import {useOutletContext} from "@remix-run/react";
import {useForeignKeySystem} from "~/hooks/useForeignKeySystem";
import {useEditorContext} from "~/hooks/useEditorContext";
import { ReactNode } from "react";

interface Props {
  schema: DataSchema;
  value: unknown;
}

export function Value({
  schema,
  value
}: Props): ReactNode {

  const { context } = useOutletContext<{ context: ReturnType<typeof useEditorContext> }>()
  const foreignKeySystem = context.foreignKeySystem;

  if ('foreignKey' in schema) {
    value = foreignKeySystem.getForeignValue(schema.foreignKey, value);
  }

  switch(schema.type){
    case 'string':
      if (schema.format === 'uuid') {
        if ('foreignKey' in schema) {
          return <>{String(value)}</> // 外部キーの場合はそのまま表示
        }
        // 最初の5文字と...で表示
        return <>{value?.toString().slice(0, 5)}...</>
      }
      return <>{String(value)}</>

    case 'number':
    case 'integer':
      return <>{String(value)}</>

    case 'boolean':
      return <>{value ? "✔" : "❎️"}</>
    
    case 'array':
      return <>{value instanceof Array && value.join(',')}</>
  }
}
