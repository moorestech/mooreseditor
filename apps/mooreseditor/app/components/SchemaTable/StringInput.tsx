import { TextInput } from "@mantine/core"
import { ComponentProps } from "react"

export const StringInput = (props: ComponentProps<typeof TextInput>) => {
  return (
    <TextInput {...props} />
  )
}
