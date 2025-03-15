import { Table } from "@mantine/core";
import { useMemo } from "react";
import { ArraySchema } from "src/libs/schema/types"
import { getTableColumns } from "src/libs/schema/ui";

interface Props {
  schema: ArraySchema;
}

export const ObjectArrayTable = ({
  schema
}: Props) => {
  const columns = useMemo(() => {
    if (schema.items.type === 'object') {
      return getTableColumns(schema)
    } else {
      throw new Error('items.type=objectでない配列はテーブル表示できません')
    }
  }, [schema])
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          {columns.map(column => (
            <Table.Th key={column}>{column}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          {JSON.stringify(schema)}
        </Table.Tr>
      </Table.Tbody>
    </Table>
  )
}
