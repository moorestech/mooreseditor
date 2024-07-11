import { Stack } from "@mantine/core"
import { ObjectSchema } from "~/schema";
import { PrimitiveTypeInput } from "./PrimitiveTypeInput";

interface Props {
  value: Record<string, any>;
  property: string;
  propertySchema: ObjectSchema;
  onChange(value: Record<string, any>): void;
} 

export const ObjectInput = ({
  value,
  propertySchema,
  onChange,
}: Props) => {
  if(!propertySchema.properties) return
  return (
    <Stack gap='xs'>
      {Array.from(Object.entries(propertySchema.properties)).map(([key, propertySchema]: [string, any]) => {
        return (
          <PrimitiveTypeInput key={key} showLabel property={key} propertySchema={propertySchema} value={value ? value[key] : null} onChange={(newValue) => onChange({...value, [key]: newValue })} />
        )
      })}
    </Stack>
  )
}
