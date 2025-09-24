import React, { useMemo } from "react";

import { Select, Loader, Text } from "@mantine/core";

import {
  useForeignKeyData,
  buildForeignKeySelectKey,
} from "../../../hooks/useForeignKeyData";

import type { FormInputProps } from "./types";
import type { UuidSchema } from "../../../libs/schema/types";

export const ForeignKeySelect: React.FC<FormInputProps<string>> = ({
  value,
  onChange,
  schema,
  jsonData,
}) => {
  const uuidSchema = schema as UuidSchema;

  console.log("ForeignKeySelect rendered:", {
    foreignKey: uuidSchema.foreignKey,
    jsonData,
    value,
  });

  const { options, loading: isLoading, error, displayValue } = useForeignKeyData(
    uuidSchema.foreignKey,
    jsonData || [],
    value,
  );

  console.log("ForeignKeySelect data:", {
    options,
    loading: isLoading,
    error,
    displayValue,
  });

  // Convert options to Mantine Select format with groups
  const selectData = useMemo(() => {
    // Check if we have any grouped data
    const hasGroups = options.some((opt) => opt.group);

    if (!hasGroups) {
      // No groups, return flat list
      return options.map((option) => ({
        value: option.id,
        label: option.display,
      }));
    }

    // Group options by their group property
    const groups = new Map<string, typeof options>();

    options.forEach((option) => {
      const groupName = option.group || "Other";
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(option);
    });

    // Convert to Mantine's grouped format
    const groupedData: any[] = [];
    groups.forEach((groupOptions, groupName) => {
      groupedData.push({
        group: groupName,
        items: groupOptions.map((option) => ({
          value: option.id,
          label:
            option.hierarchy && option.hierarchy.length > 0
              ? option.display.split(" > ").slice(1).join(" > ") // Remove group name from display
              : option.display,
        })),
      });
    });

    return groupedData;
  }, [options]);

  const selectKey = useMemo(
    () =>
      buildForeignKeySelectKey(
        uuidSchema.foreignKey,
        value,
        displayValue,
        "foreign-key-select",
      ),
    [uuidSchema.foreignKey, value, displayValue],
  );

  if (!uuidSchema.foreignKey) {
    return <Text c="red">Foreign key configuration missing</Text>;
  }

  if (isLoading) {
    return (
      <Select
        placeholder="Loading..."
        disabled
        rightSection={<Loader size="xs" />}
      />
    );
  }

  if (error) {
    return <Select placeholder={error} disabled error />;
  }

  return (
    <Select
      key={selectKey}
      data={selectData}
      value={value || ""}
      onChange={(val) => onChange(val || "")}
      placeholder={`Select ${uuidSchema.foreignKey.schemaId}`}
      searchable
      clearable={uuidSchema.optional}
      nothingFoundMessage="No options found"
      // Show current display value even if the ID is not in current options
      // This handles cases where the referenced item might have been deleted
      renderOption={({ option }) => <Text size="sm">{option.label}</Text>}
    />
  );
};
