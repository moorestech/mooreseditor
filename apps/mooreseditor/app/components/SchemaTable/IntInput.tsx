import { NumberInput } from "@mantine/core"
import { ComponentProps } from "react"

export const IntInput = (props: ComponentProps<typeof NumberInput>) => {
  return (
    <NumberInput {...props} step={1} />
  )
}
