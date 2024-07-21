import { DataSchema } from "~/schema";

interface Props {
  schema: DataSchema;
  value: unknown;
}

export function Value({
  schema,
  value
}: Props) {
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
