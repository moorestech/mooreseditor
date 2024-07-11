import { ActionIcon, Group, List, Table } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md"
import { findNonPrimitiveFields, findPrimitiveFields, ObjectSchema, Schema } from "~/schema";

interface Props {
  schema: ObjectSchema;
  row: any;
  onEdit(): void;
  onDelete(): void;
}

export function SchemaTableRow({
  schema,
  row,
  onEdit,
  onDelete,
}: Props) {
  const [isOpen, {toggle}] = useDisclosure(false)
  const commonFields = findPrimitiveFields(schema)
  const uncommonFields = findNonPrimitiveFields(schema, row)
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
        {commonFields.map((commonField: string) => (
          <Table.Td key={commonField}>
            {row[commonField]}
          </Table.Td>
        ))}
        <Table.Td>
          <Group gap='xs' styles={{ root: { flexWrap: 'nowrap' } }}>
            <ActionIcon variant='outline' onClick={() => onEdit()}>
              <MdEdit />
            </ActionIcon>
            <ActionIcon variant='outline' onClick={() => onDelete()}>
              <MdDelete />
            </ActionIcon>
          </Group>
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
                          case 'array':
                            return (
                              <Table.Td key={uncommonField}>
                                <List>
                                  {(row[uncommonField] ?? []).map((value: any) => (
                                    <List.Item>
                                      {String(value)}
                                    </List.Item>
                                  ))}
                                </List>
                              </Table.Td>
                            )
                          case 'object':
                            return (
                              <Table.Td key={uncommonField}>
                                <Table>
                                  <Table.Tbody>
                                    {Object.entries(row[uncommonField] ?? {}).map(([key, value]) => (
                                      <Table.Tr>
                                        <Table.Th>{key}</Table.Th>
                                        <Table.Td>{String(value)}</Table.Td>
                                      </Table.Tr>
                                    ))}
                                  </Table.Tbody>
                                </Table>
                              </Table.Td>
                            )
                          default:
                            return (
                              <Table.Td key={uncommonField}>
                                {row[uncommonField]}
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
