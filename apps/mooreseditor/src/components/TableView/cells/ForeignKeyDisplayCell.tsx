import React from "react";

import { Text } from "@mantine/core";

import { useForeignKeyData } from "../../../hooks/useForeignKeyData";

import type { UuidSchema } from "../../../libs/schema/types";
import type { ColumnDisplayProps } from "../TableView.types";

export const ForeignKeyDisplayCell: React.FC<ColumnDisplayProps> = ({ column, value, jsonData }) => {
  const columnSchema = column as UuidSchema;
  
  const { displayValue, loading, error } = useForeignKeyData(
    columnSchema.foreignKey,
    jsonData || [],
    value
  );

  if (!value) {
    return <Text size="sm" c="dimmed">-</Text>;
  }

  if (loading) {
    return <Text size="sm" c="dimmed">Loading...</Text>;
  }

  if (error) {
    return <Text size="sm" c="dimmed" title={value}>{value.slice(0, 8)}...</Text>;
  }

  return <Text size="sm" title={value}>{displayValue || `${value.slice(0, 8)}...`}</Text>;
};