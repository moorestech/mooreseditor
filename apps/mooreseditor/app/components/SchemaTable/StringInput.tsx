import { Input } from "@mantine/core"
import { ComponentProps } from "react"

export const StringInput = (props: ComponentProps<typeof Input>) => {
  return (
    <Input {...props} />
  )
}
