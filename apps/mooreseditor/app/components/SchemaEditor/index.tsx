import { getPropSchema, isArraySchema, isObjectArraySchema, isObjectSchema, isDefaultOpen, isPrimitiveSchema, Schema } from "~/schema"
import { SchemaTable } from "./SchemaTable";
import { Box, Group, List, Stack, Text } from "@mantine/core";
import { Summary } from "./Summary";
import { PrimitiveTypeInput } from "./inputs/PrimitiveTypeInput";
import { ArrayInput } from "./inputs/ArrayInput";
import { Value } from "./Value";

interface Props {
  schema: Schema;
  value: any;
  isEditing?: boolean;
  onSave?(value: any): void;
}

export function SchemaEditor({
  schema,
  value,
  isEditing = false,
  onSave = () => { },
}: Props) {
  if (isObjectSchema(schema)) {
    return (
      <Stack gap='sm'>
        {Object.keys(schema.properties).map((propName: string) => {
          const propSchema = getPropSchema(schema, propName, value)
          if (isPrimitiveSchema(propSchema)) {
            if (isEditing) {
              return (
                <Box>
                  <PrimitiveTypeInput
                    showLabel={true}
                    property={propName}
                    propertySchema={propSchema}
                    value={(value ?? {})[propName]}
                    onChange={(newValue) => {
                      onSave({ ...(value ?? {}), [propName]: newValue })
                    }}
                  />
                </Box>
              )
            } else {
              return (
                <Group wrap='nowrap'>
                  <Text fw='bold' size='sm'>
                    {propName}
                  </Text>
                  <Text size='sm'>
                    {value && (<Value schema={propSchema} value={value[propName]} />)}
                  </Text>
                </Group>
              )
            }
          } else {
            return (
              <Summary isOpenByDefault={isDefaultOpen(schema)} label={propName}>
                <SchemaEditor
                  schema={propSchema}
                  value={value && value[propName]}
                  isEditing={isEditing}
                  onSave={(newValue) => {
                    onSave({
                      ...(value ?? {}),
                      [propName]: newValue
                    })
                  }}
                />
              </Summary>
            )
          }
        })}
      </Stack>
    )
  } else if (isArraySchema(schema) && !isObjectArraySchema(schema)) {
    return isEditing
      ? (
        <ArrayInput propertySchema={schema} value={value} onChange={(newValue) => {
          onSave(newValue)
        }} />
      )
      : (
        <List>
          {(value ?? []).map((item: any) => {
            return <List.Item>{item}</List.Item>
          })}
        </List>
      )
  } else if (isObjectArraySchema(schema)) {
    return (
      <SchemaTable
        schema={schema}
        value={value ?? []}
        onSave={(newValue) => {
          onSave(newValue)
        }}
      />
    )
  }
}
