import { Flex, NumberInput, Stack } from "@mantine/core"
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
        <Flex direction={dimensions <= 2 ? 'row' : 'column'} gap='xs'>
        {new Array(dimensions).fill(null).map((_, i) => (
          <NumberInput {...props} label={['x', 'y', 'z', 'w'][i]} key={i} w={dimensions <= 2 ? 80 : 160} />
        ))}
        </Flex>
      </Stack>
    </FormWrapper>
  )
}
