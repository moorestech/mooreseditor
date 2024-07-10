import { ActionIcon, Group, Table } from "@mantine/core"
import { HiDotsHorizontal } from 'react-icons/hi'
import { BsPlusLg } from 'react-icons/bs'
import { MdDelete } from 'react-icons/md'
import { Validator } from "jsonschema";
import { Schema, DataSchema, ArraySchema } from "~/types/schema";
import { useState } from "react";
import { PrimitiveTypeInput } from "./PrimitiveTypeInput";
import { ObjectInput } from "./ObjectInput";

interface Props<T> {
  schema: DataSchema;
  schemaId: string;
  validator: Validator;
  values: T[];
  onSave(values: any[]): void
}

export function SchemaTable<T>({
  values,
  schema,
  schemaId,
  validator,
  onSave,
}: Props<T>) {
  // schemaの直下にはarrayがあるので、それを取得
  if(schema.type != 'object') return
  const [containerListField] = listFields(schema.properties!)
  const containerList = schema.properties![containerListField] as ArraySchema

  if(!containerList.items || containerList.items instanceof Array) return null
  if(!('properties' in containerList.items)) return null // 一旦oneOf/allOf/anyOfには非対応
  if(!containerList.items.properties || containerList.items.properties instanceof Array) return null

  const properties = containerList.items.properties

  const commonFields = listCommonFields(containerList.items.properties)

  const uncommonFields = listUncommonFields(containerList.items.properties)
  const [editingValue, setEditingValue] = useState<{ index: number, value: any } | null>(null)

  const [newValue, setNewValue] = useState<any>({})
  const addValue = () => {
    onSave([
      ...values,
      newValue
    ])
    setNewValue({})
  }
  const updateValue = () => {
    onSave(values.map((value, index) => {
      if(index === editingValue?.index){
        return editingValue
      }else{
        return value
      }
    }))
  }
  const deleteValue = (index: number) => {
    onSave(values.filter((_, valueIndex) => {
      return index !== valueIndex
    }))
  }

  return (
    <>
      <Table>
        <Table.Thead>
          <Table.Tr>
            {commonFields.map((commonField: string) => (
              <Table.Th key={commonField}>{commonField}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {values.map((value, index) => (
            <Table.Tr key={index}>
              {commonFields.map((commonField: string) => (
                <Table.Td key={commonField}>
                  {value[commonField]}
                </Table.Td>
              ))}
              <Table.Td>
                <Group gap='xs' styles={{ root: { flexWrap: 'nowrap' } }}>
                  <ActionIcon variant='outline' onClick={() => setEditingValue(value)}>
                    <HiDotsHorizontal />
                  </ActionIcon>
                  <ActionIcon variant='outline' onClick={() => deleteValue(index)}>
                    <MdDelete />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
          <Table.Tr>
            {commonFields.map((commonField: string) => {
              const propertySchema = properties[commonField] as Schema
              if('type' in propertySchema){
                switch(propertySchema.type){
                  default:
                    return (
                      <Table.Td key={commonField}>
                        <PrimitiveTypeInput value={newValue[commonField]} property={commonField} propertySchema={propertySchema} onChange={(value) => setNewValue({...newValue, [commonField]: value})} />
                      </Table.Td>
                    )
                  case 'object':
                    return (
                      <Table.Td key={commonField}>
                      <ObjectInput value={newValue[commonField]} property={commonField} propertySchema={propertySchema} onChange={(value) => setNewValue({...newValue, [commonField]: value})} />
                      </Table.Td>
                    )
                }
              }else{
                return null
              }
            })}
            <Table.Td>
              <ActionIcon variant='outline' onClick={() => addValue()}>
                <BsPlusLg />
              </ActionIcon>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </>
  )
}

const listFields = (properties: object): string[] => {
  return Array.from(Object.keys(properties))
    .filter(propertyName => ['required'].indexOf(propertyName) < 0)
}

const listCommonFields = (properties: object): string[] => {
  return Array.from(Object.entries(properties))
    .filter(([propertyName, property]) => {
      if(['required'].indexOf(propertyName) >= 0){
        return false
      }
      return Array.from(Object.keys(property)).findIndex(propName => {
        return ["oneOf", "allOf", "anyOf"].indexOf(propName) > -1
      }) == -1
    })
    .map(([propertyId, _]) => propertyId)
}

const listUncommonFields = (properties: object): string[] => {
  return Array.from(Object.entries(properties))
    .filter(([_, property]) => {
      return Array.from(Object.keys(property)).findIndex(propName => {
        return ["oneOf", "allOf", "anyOf"].indexOf(propName) > -1
      }) > -1
    })
    .map(([propertyId, _]) => propertyId)
}
