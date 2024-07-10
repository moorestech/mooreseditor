import { NumberInput, Stack } from "@mantine/core"
import { ComponentProps } from "react"
import { FormWrapper } from '~/components/FormWrapper'

type Props = ComponentProps<typeof NumberInput> & { dimensions: number }

export const VectorInput = ({
  label,
  dimensions,
  ...props
}: Props) => {
  return (
    <FormWrapper label={label}>
      <Stack gap='xs'>
        {new Array(dimensions).fill(null).map((_, i) => (
          <NumberInput {...props} key={i} />
        ))}
      </Stack>
    </FormWrapper>
  )
}
