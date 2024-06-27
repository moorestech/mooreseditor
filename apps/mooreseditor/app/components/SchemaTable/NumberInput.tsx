import { NumberInput as MantineNumberInput } from "@mantine/core"
import { ComponentProps } from "react"

export const NumberInput = (props: ComponentProps<typeof MantineNumberInput>) => {
  return (
    <MantineNumberInput {...props} />
  )
}
