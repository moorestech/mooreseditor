import { NumberInput as MantineNumberInput } from "@mantine/core"
import { ComponentProps } from "react"

export const NumberInput = (props: ComponentProps<typeof MantineNumberInput>) => {
  if(['string', 'number', 'undefined', 'null'].indexOf(typeof props.value) === -1) return
  return (
    <MantineNumberInput {...props} />
  )
}
