import { ActionIcon, Group, Table } from "@mantine/core"
import { HiDotsHorizontal } from 'react-icons/hi'
import { BsPlusLg } from 'react-icons/bs'
import { MdDelete } from 'react-icons/md'
import { Validator } from "jsonschema";
import { useState } from "react";
import { IntInput } from "./IntInput";
import { BooleanInput } from "./BooleanInput";
import { StringInput } from "./StringInput";
import { EnumInput } from "./EnumInput";
import { VectorInput } from "./VectorInput";
import { ArrayInput } from "./ArrayInput";
import { NumberInput } from "./NumberInput";

interface Props {
  schema: any;
  schemaId: string;
  validator: Validator;
  values: any[];
  onSave(values: any[]): void
}

export const SchemaTable = ({
  values,
  schema,
  schemaId,
  validator,
  onSave,
}: Props) => {
  // schemaの直下にはarrayがあるので、それを取得
  const [containerListField] = listFields(schema.properties)
  const containerList = schema.properties[containerListField]

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
            {commonFields.map((commonField: string) => (
              <Table.Td key={commonField}>
                {(() => {
                  const propertySchema = containerList.items.properties[commonField]
                  switch(propertySchema.type){
                    case 'integer':
                      return <IntInput value={newValue[commonField]} />
                    case 'number':
                      return <NumberInput value={newValue[commonField]} />
                    case 'boolean':
                      return <BooleanInput value={newValue[commonField]} />
                    case 'string':
                      return <StringInput value={newValue[commonField]} />
                    case 'enum':
                      return <EnumInput value={newValue[commonField]} data={propertySchema.enum} />
                    case 'array':
                      switch(propertySchema.pattern){
                        case '@vector2':
                          return <VectorInput dimensions={2} value={newValue[commonField]} step={1} />
                        case '@vector3':
                          return <VectorInput dimensions={3} value={newValue[commonField]} step={1} />
                        case '@vector4':
                          return <VectorInput dimensions={4} value={newValue[commonField]} step={1} />
                        case '@vector2Int':
                          return <VectorInput dimensions={2} value={newValue[commonField]} step={1} />
                        case '@vector3Int':
                          return <VectorInput dimensions={3} value={newValue[commonField]} step={1} />
                        case '@vector4Int':
                          return <VectorInput dimensions={4} value={newValue[commonField]} step={1} />
                        default:
                          return <ArrayInput value={newValue[commonField] ?? []} onChange={(values) => setNewValue(values)} />
                      }
                    case 'array':
                    case 'object':
                  }
                })()}
              </Table.Td>
            ))}
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
