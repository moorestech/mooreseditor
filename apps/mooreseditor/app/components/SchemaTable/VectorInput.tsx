import { NumberInput, Stack } from "@mantine/core"
import { ComponentProps } from "react"

type Props = ComponentProps<typeof NumberInput> & { dimensions: number }

export const VectorInput = ({
  dimensions,
  ...props
}: Props) => {
  return (
    <Stack gap='xs'>
      {new Array(dimensions).fill(null).map((_, i) => (
        <NumberInput {...props} key={i} />
      ))}
    </Stack>
  )
}
