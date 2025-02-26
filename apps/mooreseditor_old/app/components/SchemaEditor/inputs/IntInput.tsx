import { NumberInput } from "@mantine/core"
import { ComponentProps } from "react"

export const IntInput = ({
  ...props
}: ComponentProps<typeof NumberInput>) => {
  if(['string', 'number', 'undefined', 'null'].indexOf(typeof props.value) === -1) return
  return (
    <NumberInput {...props} />
  )
}
