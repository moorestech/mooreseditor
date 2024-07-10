import { ActionIcon, Group, Table } from "@mantine/core"
import { findNonPrimitiveFields, findPrimitiveFields, ObjectSchema, Schema } from "~/schema";
import { PrimitiveTypeInput } from "./inputs/PrimitiveTypeInput";
import { ObjectInput } from "./inputs/ObjectInput";
import { BsPlusLg } from "react-icons/bs";
import { useState } from "react";
import { IoChevronForward, IoChevronDown } from "react-icons/io5";
import { useDisclosure } from "@mantine/hooks";
import { MdCheck } from "react-icons/md";

interface Props {
  schema: ObjectSchema;
  row?: any;
  onSubmit(row: any): void;
}

export function SchemaTableRowForm({
  schema,
  row,
  onSubmit,
}: Props) {
  const [isOpen, {toggle}] = useDisclosure(false)
  const [newValue, setNewValue] = useState<any>(row ?? {})
  const commonFields = findPrimitiveFields(schema)
  const uncommonFields = findNonPrimitiveFields(schema, newValue)
  return (
    <>
      <Table.Tr>
        <Table.Td>
          {uncommonFields.length > 0 && (
            <ActionIcon variant='transparent' onClick={() => toggle()}>
              {isOpen ? <IoChevronDown /> : <IoChevronForward />}
            </ActionIcon>
          )}
        </Table.Td>
        {commonFields.map((commonField: string) => {
          const propertySchema = schema.properties[commonField] as Schema
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
          {row ? (
            <Group gap='xs'>
              <ActionIcon variant='outline' onClick={() => {
                onSubmit(newValue)
                setNewValue({})
              }}>
                <MdCheck />
              </ActionIcon>
            </Group>
          ) : (
            <ActionIcon variant='outline' onClick={() => {
              onSubmit(newValue)
              setNewValue({})
            }}>
              <BsPlusLg />
            </ActionIcon>
          )}
        </Table.Td>
      </Table.Tr>
      {isOpen && (
        <Table.Tr>
          <Table.Td />
          <Table.Td colSpan={commonFields.length + 1}>
            <Table.ScrollContainer minWidth={500}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    {uncommonFields.map((uncommonField: string) => {
                      const propertySchema = schema.properties[uncommonField] as Schema
                      if(!('type' in propertySchema)) return null
                      return (
                        <Table.Th key={uncommonField}>
                          {uncommonField}
                        </Table.Th>
                      )
                    })}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    {uncommonFields.map((uncommonField: string) => {
                      const propertySchema = schema.properties[uncommonField] as Schema
                      if('type' in propertySchema){
                        switch(propertySchema.type){
                          default:
                            return (
                              <Table.Td key={uncommonField}>
                                <PrimitiveTypeInput value={newValue[uncommonField]} property={uncommonField} propertySchema={propertySchema} onChange={(value) => setNewValue({...newValue, [uncommonField]: value})} />
                              </Table.Td>
                            )
                          case 'object':
                            return (
                              <Table.Td key={uncommonField}>
                                <ObjectInput value={newValue[uncommonField]} property={uncommonField} propertySchema={propertySchema} onChange={(value) => setNewValue({...newValue, [uncommonField]: value})} />
                              </Table.Td>
                            )
                        }
                      }else{
                        return null
                      }
                    })}
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Table.Td>
        </Table.Tr>
      )}
    </>
  )
}
