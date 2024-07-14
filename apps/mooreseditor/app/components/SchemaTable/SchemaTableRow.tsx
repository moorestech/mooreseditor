import { ActionIcon, Group, List, Table, ThemeIcon, Tooltip } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { ErrorObject } from "ajv";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import { MdDelete, MdEdit, MdInfo } from "react-icons/md"
import { findNonPrimitivePropNames, findPrimitivePropNames, getPropSchema, ObjectSchema, transformErrors } from "~/schema";

interface Props {
  schema: ObjectSchema;
  errors?: Array<ErrorObject>;
  row: any;
  onEdit(): void;
  onDelete(): void;
}

export function SchemaTableRow({
  schema,
  errors = [],
  row,
  onEdit,
  onDelete,
}: Props) {
  const [isOpen, { toggle }] = useDisclosure(false)
  const commonFields = findPrimitivePropNames(schema)
  const uncommonFields = findNonPrimitivePropNames(schema, row)
  const transformedErrors = transformErrors(errors)
  return (
    <>
      <Table.Tr>
        <Table.Td>
          {uncommonFields.length > 0 && (
            <ActionIcon variant='light' onClick={() => toggle()}>
              {isOpen ? <IoChevronDown /> : <IoChevronForward />}
            </ActionIcon>
          )}
        </Table.Td>
        {commonFields.map((commonField: string) => {
          const errors = (transformedErrors[commonField] ?? []).join('\n')
          return (
            <Table.Td key={commonField}>
              {
                errors && (
                  <Tooltip color='red' label={errors}>
                    <ThemeIcon color='red' variant='light'>
                      <MdInfo />
                    </ThemeIcon>
                  </Tooltip>
                )
              }
              {(() => {
                const propSchema = getPropSchema(schema, commonField, row)
                switch (propSchema.type) {
                  case 'boolean':
                    return row[commonField] ? '☑' : '❎️'
                  default:
                    return row[commonField]
                }
              })()}
            </Table.Td>
          )
        })}
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
                      const propertySchema = getPropSchema(schema, uncommonField, row)
                      if (!('type' in propertySchema)) return null
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
                      const propertySchema = getPropSchema(schema, uncommonField, row)
                      const errors = (transformedErrors[uncommonField] ?? []).join('\n')
                      if ('type' in propertySchema) {
                        switch (propertySchema.type) {
                          case 'array':
                            return (
                              <Table.Td key={uncommonField}>
                                {
                                  errors && (
                                    <Tooltip color='red' label={errors}>
                                      <ThemeIcon color='red' variant='light'>
                                        <MdInfo />
                                      </ThemeIcon>
                                    </Tooltip>
                                  )
                                }
                                <List>
                                  {(row[uncommonField] ?? []).map((value: any, i: number) => (
                                    <List.Item key={i}>
                                      {String(value)}
                                    </List.Item>
                                  ))}
                                </List>
                              </Table.Td>
                            )
                          case 'object':
                            return (
                              <Table.Td key={uncommonField}>
                                {
                                  errors && (
                                    <Tooltip color='red' label={errors}>
                                      <ThemeIcon color='red' variant='light'>
                                        <MdInfo />
                                      </ThemeIcon>
                                    </Tooltip>
                                  )
                                }
                                <Table>
                                  <Table.Tbody>
                                    {Object.entries(row[uncommonField] ?? {}).map(([key, value]) => (
                                      <Table.Tr key={key}>
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
                                {
                                  errors && (
                                    <Tooltip color='red' label={errors}>
                                      <ThemeIcon color='red' variant='light'>
                                        <MdInfo />
                                      </ThemeIcon>
                                    </Tooltip>
                                  )
                                }
                                {row[uncommonField]}
                              </Table.Td>
                            )
                        }
                      } else {
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
