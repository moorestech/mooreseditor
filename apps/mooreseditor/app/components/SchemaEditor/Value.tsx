import { DataSchema } from "~/schema";
import {useOutletContext} from "@remix-run/react";
import {useMasterDirectory} from "~/hooks/useMasterDirectory";
import {useForeignKeySystem} from "~/hooks/useForeignKeySystem";

interface Props {
  schema: DataSchema;
  value: unknown;
}

export function Value({
  schema,
  value
}: Props) {

  const context = useOutletContext<{foreign: ReturnType<typeof useForeignKeySystem> }>()

  if ('foreignKey' in schema) {
    value = context.foreign.getForeignValue(schema.foreignKey, value);
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
