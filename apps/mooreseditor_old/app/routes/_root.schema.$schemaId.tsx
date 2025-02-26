import { LoaderFunctionArgs } from "@remix-run/node";
import { useOutletContext } from "@remix-run/react";
import { useLayoutEffect, useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { SchemaEditor } from "~/components/SchemaEditor";
import schemaConfig from '~/_config'
import {useEditorContext} from "~/hooks/useEditorContext";

export const loader = ({ params }: LoaderFunctionArgs) => {
  const { schemaId } = params;
  return typedjson({
    schemaId,
  })
}

export default function Schema() {
  const { context } = useOutletContext<{ context: ReturnType<typeof useEditorContext> }>()
  const master = context.masterDirectory;

  const { schemaId,} = useTypedLoaderData()

  const schema = schemaConfig.schemas[schemaId]!.schema

  const [values, setValues] = useState({ data: [] })
  useLayoutEffect(() => {
    master.loadAllMasterData(Array.from(Object.keys(schemaConfig.schemas)))
    master.openMaster(schemaId).then((values: any | undefined) => {
      if(!values) return
      setValues(values)
    })
  }, [master.state, schemaId])

  return (
    <SchemaEditor
      schema={schema}
      value={values}
      onSave={async (values: any) => {
        await master.saveMaster(schemaId, values)
        setValues(values)
      }}
    />
  )
}
