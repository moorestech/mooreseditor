import { Table } from "@mantine/core";
import { useReactTable } from '@tanstack/react-table';
import { useMemo } from "react";
import { SchemaContainer } from "src/libs/schema/types";
import { getTableColumns } from "src/libs/schema/ui";

interface Props {
  schema: SchemaContainer;
}

export const MasterTable = ({
  schema
}: Props) => {
  const columns = useMemo(() => {
    return getTableColumns(schema)
  }, [schema])

  switch(schema){
  }
}

