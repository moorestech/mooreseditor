import { Table } from "@mantine/core"
import { DataSchema, ArraySchema, findPrimitivePropNames, ObjectSchema } from "~/schema";
import { SchemaTableRow } from "./SchemaTableRow";
import { SchemaTableRowForm } from "./SchemaTableRowForm";
import { useEffect, useState } from "react";
import { Ajv, ErrorObject } from "ajv";

interface Props<T> {
  schema: DataSchema;
  schemaId: string;
  validator: Ajv;
  values: { data: T[] };
  onSave(values: any): void
}

export function SchemaTable<T>({
  values,
  schema,
  schemaId,
  validator,
  onSave,
}: Props<T>) {
  // schemaの直下にはarrayがあるので、それを取得
  if (schema.type != 'object') return
  const containerList = schema.properties!.data as ArraySchema

  if (!containerList.items || containerList.items instanceof Array) return null
  if (!('properties' in containerList.items)) return null // 一旦oneOf/allOf/anyOfには非対応
  if (!containerList.items.properties || containerList.items.properties instanceof Array) return null

  const addRow = (newValue: any) => {
    onSave({ ...values, data: [...values.data, newValue] })
  }
  const updateRow = (index: number, newValue: any) => {
    onSave({ ...values, data: values.data.map((value, i) => index === i ? newValue : value) })
  }
  const deleteRow = (index: number) => {
    onSave({ ...values, data: values.data.filter((_, i) => index !== i) })
  }

  const [errors, setErrors] = useState<Array<ErrorObject>>([])

  useEffect(() => {
    console.log(validator)
    if(validator && values){
      validator.validate(`/${schemaId}`, values)
      setErrors(validator.errors)
    }
  }, [values, schema])

  return (
    <Table.ScrollContainer minWidth={500} type='native'>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            {findPrimitivePropNames(containerList.items).map((commonField: string) => (
              <Table.Th key={commonField}>{commonField}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {values.data.map((value, i) => (
            <SchemaTableRowWrapper
              key={i}
              schema={containerList.items as ObjectSchema}
              row={value}
              onSubmit={(value) => updateRow(i, value)}
              onDelete={() => deleteRow(i)}
              errors={errors ? errors.filter(error => error.dataPath === `.data[${i}]`) : []}
            />
          ))}
          <SchemaTableRowForm
            schema={containerList.items as ObjectSchema}
            onSubmit={(value) => addRow(value)}
          />
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}

interface SchemaTableRowWrapperProps {
  schema: ObjectSchema;
  row: any;
  errors: Array<ErrorObject>;
  onSubmit(row: any): void;
  onDelete(): void;
}

const SchemaTableRowWrapper = ({ onSubmit, errors, ...props }: SchemaTableRowWrapperProps) => {
  const [isEditing, setIsEditing] = useState(false)
  if (isEditing) {
    return (
      <SchemaTableRowForm {...props} errors={errors} onSubmit={(newValue) => {
        setIsEditing(false)
        onSubmit(newValue)
      }} />
    )
  } else {
    return (
      <SchemaTableRow {...props} errors={errors} onEdit={() => setIsEditing(true)} />
    )
  }
}
