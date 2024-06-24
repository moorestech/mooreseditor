import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { SchemaTable } from "~/components/SchemaTable";
import schemaConfig from '~/schema/_config'

export const loader = ({ params }: LoaderFunctionArgs) => {
  const { schemaId } = params;
  return typedjson({
    schemaId,
    schema: schemaConfig.schemas[schemaId!].schema,
    validator: schemaConfig.validator,
  })
}

export default function Schema() {
  const {
    schemaId,
    schema,
    validator
  } = useTypedLoaderData()
  return (
    <SchemaTable
      schemaId={schemaId}
      schema={schema}
      validator={validator}
    />
  )
}
