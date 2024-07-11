import { Button, NumberInput, Stack } from "@mantine/core"
import { ComponentProps } from "react"
import { BsPlusLg } from "react-icons/bs"
import { ArraySchema, DataSchema } from "~/schema";
import { PrimitiveTypeInput } from "./PrimitiveTypeInput";

type Props = ComponentProps<typeof NumberInput> & {
  propertySchema: ArraySchema,
  value: any[],
  onChange(value: any[]): void;
}

export const ArrayInput = ({
  propertySchema,
  value,
  onChange,
}: Props) => {
  const add = () => {
    onChange([
      ...value,
      ''
    ])
  }
  return (
    <Stack gap='xs'>
      {value.map((eachValue, i) => {
        return <PrimitiveTypeInput propertySchema={propertySchema.items as DataSchema} value={eachValue} onChange={(newValue) => {
          onChange([
            ...value.map((v, j) => i === j ? newValue : v)
          ])
        }} />
      })}
      <Button leftSection={<BsPlusLg />} onClick={add} w={160}>追加</Button>
    </Stack>
  )
}
