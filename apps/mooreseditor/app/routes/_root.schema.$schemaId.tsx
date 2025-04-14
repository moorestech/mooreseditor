import { LoaderFunctionArgs } from "@remix-run/node";
import { useOutletContext } from "@remix-run/react";
import { useLayoutEffect, useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { SchemaEditor } from "~/components/SchemaEditor";
import schemaConfig from '~/_config'
import { useEditorContext } from "~/hooks/useEditorContext";
import { ensureEmptyStructures } from "~/schema"; // ensureEmptyStructures のみインポート
import type { Schema } from "~/schema"; // Schema は type としてインポート

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

  // schemaId を schemaConfig.schemas のキーの型にキャスト
  const schema = schemaConfig.schemas[schemaId as keyof typeof schemaConfig.schemas]!.schema

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
        // スキーマに基づいて空のオブジェクト/配列を補完
        const validatedValues = ensureEmptyStructures(schema as Schema, values); // schema を Schema 型として渡す
        await master.saveMaster(schemaId, validatedValues);
        setValues(validatedValues); // 補完後の値で状態を更新
      }}
    />
  )
}
