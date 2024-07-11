import { LoaderFunctionArgs } from "@remix-run/node";
import { useOutletContext } from "@remix-run/react";
import { FromSchema } from "json-schema-to-ts";
import { useLayoutEffect, useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { SchemaTable } from "~/components/SchemaTable";
import { useMasterDirectory } from "~/hooks/useMasterDirectory";
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
  type SchemaType = FromSchema<typeof schema>
  const { master } = useOutletContext<{
    master: ReturnType<typeof useMasterDirectory>
  }>()
  const [values, setValues] = useState({ data: [] })
  useLayoutEffect(() => {
    master.openMaster(schemaId).then((values: any | undefined) => {
      if(!values) return
      setValues(values)
    })
  }, [master.state, schemaId])
  return (
    <SchemaTable<SchemaType>
      schemaId={schemaId}
      schema={schema}
      values={values}
      validator={validator}
      onSave={async (values: any) => {
        await master.saveMaster(schemaId, values)
        setValues(values)
      }}
    />
  )
}
