import { ActionIcon, Collapse, Group, Stack, Table } from "@mantine/core"
import {
    DataSchema,
    findNonPrimitivePropNames,
    findPrimitivePropNames,
    getPropSchema,
    isDefaultOpen,
    ObjectArraySchema,
    ObjectSchema,
    StringSchema
} from "~/schema"
import { Value } from "./Value";
import { Summary } from "./Summary";
import { SchemaEditor } from ".";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { useDisclosure } from "@mantine/hooks";
import {useEffect, useState} from "react";
import { MdCheck, MdDelete, MdEdit } from "react-icons/md";
import { PrimitiveTypeInput } from "./inputs/PrimitiveTypeInput";
import { v4 as uuid } from 'uuid';

interface Props {
  schema: ObjectArraySchema,
  value: any,
  onSave?(values: any): void
}

export function SchemaTable({
  schema,
  value,
  onSave = () => { }
}: Props) {
  if (!(value instanceof Array)) {
    throw new Error('未対応の形式です')
  }
  const primitive = findPrimitivePropNames(schema.items)
  const [newRow, setNewRow] = useState({})
  return (
    <Table>
      <Table.Thead>
        <Table.Th></Table.Th>
        {Object.keys(primitive).map(primitiveField => (
          <Table.Th>{primitiveField}</Table.Th>
        ))}
      </Table.Thead>
      <Table.Tbody>
        {value.map((row, i: number) => {
          return (
            <SchemaRow
              schema={schema.items}
              value={row}
              onSave={(newValue: any) => {
                onSave([
                  ...value.map((eachValue: any, j: number) => {
                    return i == j ? newValue : eachValue
                  }),
                ])
              }}
              onDelete={() => onSave(value.filter((_, j: number) => i != j))}
            />
          )
        })}
        <SchemaRow schema={schema.items} isNew value={newRow} onSave={setNewRow}
                   onAdd={() => {
                       const defaultValue = Object.keys(schema.items.properties).
                       map((propName: string) =>
                       {
                           const prop = getPropSchema(schema.items, propName, newRow)
                           if (!prop) return null

                           if (prop.type === 'string' && prop.autoGenerated) {
                               switch (prop.format) {
                                   case 'uuid':
                                       return [propName, uuid()]
                               }
                           }
                       }).filter(value => value != null)

                       onSave([
                       ...value,
                       {
                         ...newRow,
                         ...Object.fromEntries(defaultValue)
                       }
                     ])
                     setNewRow({})
                   }
                   }/>
      </Table.Tbody>
    </Table>
  )
}

interface RowProps {
  schema: ObjectSchema;
  value: Record<string, unknown>;
  isNew?: boolean;
  onSave?(values: any): void;
  onAdd?(): void;
  onDelete?(): void;
}

function SchemaRow({
  schema,
  value,
  isNew = false,
  onSave = () => { },
  onAdd = () => { },
  onDelete = () => { },
}: RowProps) {
  const primitiveFields = findPrimitivePropNames(schema);
  const nonPrimitiveFields = findNonPrimitivePropNames(schema, value);
  const [isOpen, { toggle }] = useDisclosure(false);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {setIsEditing(false);}, [schema]);

  return (
    <>
      <Table.Tr>
        <Table.Td>
          <ActionIcon size='xs' onClick={toggle}>
            {isOpen ? (
              <BsChevronDown />
            ) : (
              <BsChevronRight />
            )}
          </ActionIcon>
        </Table.Td>
        {Object.entries(primitiveFields).map(([propName, propSchema]: [string, DataSchema]) => {
          return (
            <Table.Td>
              {(isEditing || isNew) ? (
                <PrimitiveTypeInput
                  property={propName}
                  propertySchema={propSchema}
                  value={value[propName]}
                  onChange={(newValue) => {
                    onSave({ ...value, [propName]: newValue })
                  }}
                />
              ) : (
                <Value schema={propSchema} value={value[propName]} />
              )}
            </Table.Td>
          )
        })}
        <Table.Td>
          {(isEditing || isNew) ? (
            <ActionIcon onClick={() => {
              onAdd()
              setIsEditing(false)
            }}>
              <MdCheck />
            </ActionIcon>
          ) : (
            <Group wrap='nowrap'>
              <ActionIcon onClick={() => setIsEditing(true)}>
                <MdEdit />
              </ActionIcon>
              <ActionIcon onClick={onDelete}>
                <MdDelete />
              </ActionIcon>
            </Group>
          )}
        </Table.Td>
      </Table.Tr>
      <Table.Tr p={0}>
        <Table.Td p={0}></Table.Td>
        <Table.Td p={0} colSpan={primitiveFields.length + 1}>
          <Collapse in={isOpen}>
            <Stack p={'xs'}>
              {Object.entries(nonPrimitiveFields).map(([propName, propSchema]: [string, DataSchema]) => {
                return <Summary isOpenByDefault={isDefaultOpen(schema)} label={propName}>
                  <SchemaEditor
                    schema={propSchema}
                    value={value[propName]}
                    isEditing={isEditing || isNew}
                    onSave={(newValue) => onSave({ ...value, [propName]: newValue })}
                  />
                </Summary>
              })}
            </Stack>
          </Collapse>
        </Table.Td>
      </Table.Tr>
    </>
  )
}
