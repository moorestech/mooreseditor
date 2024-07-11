import { Flex, NumberInput, Stack } from "@mantine/core"
import { ComponentProps } from "react"
import { FormWrapper } from '~/components/FormWrapper'

type Props = ComponentProps<typeof NumberInput> & {
  dimensions: number,
  value: Array<number>,
  onChange(value: Array<number>): void;
}

export const VectorInput = ({
  label,
  dimensions,
  onChange,
  value,
  ...props
}: Props) => {
  return (
    <FormWrapper label={label}>
      <Stack gap='xs'>
        <Flex direction={dimensions <= 2 ? 'row' : 'column'} gap='xs'>
        {new Array(dimensions).fill(null).map((_, i) => (
          <NumberInput
            key={i}
            {...props}
            label={['x', 'y', 'z', 'w'][i]}
            w={dimensions <= 2 ? 80 : 160}
            value={value[i]}
            onChange={(newValue: string | number) => {
              onChange(value.map((v, j)=> j == i ? Number(newValue) : v))
            }}
          />
        ))}
        </Flex>
      </Stack>
    </FormWrapper>
  )
}
