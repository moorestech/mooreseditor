import { Input, Table } from "@mantine/core"
import { Validator } from "jsonschema";

interface Props {
  schema: any;
  schemaId: string;
  validator: Validator;
}

export const SchemaTable = ({
  schema,
  schemaId,
  validator
}: Props) => {
  console.log(schema)
  // schemaの直下にはarrayがあるので、それを取得
  const [containerListField] = listFields(schema.properties)
  const containerList = schema.properties[containerListField]

  const itemPropertyFields = listFields(containerList.items.properties)
  const itemProperties = containerList.items.properties

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          {itemPropertyFields.map((itemPropertyField: string) => (
            <Table.Th key={itemPropertyField}>{itemPropertyField}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr key="a">
          {itemPropertyFields.map((itemPropertyField: string) => (
            <Table.Td key={itemPropertyField}>
              <Input
                variant="unstyled"
                placeholder="Input component"
                style={{ width: '50px' }}
              />
            </Table.Td>
          ))}
        </Table.Tr>
      </Table.Tbody>
    </Table>
  )
}

const listFields = (properties: object): string[] => {
  return Array.from(Object.keys(properties))
    .filter(property => ['required'].indexOf(property) < 0)
}
