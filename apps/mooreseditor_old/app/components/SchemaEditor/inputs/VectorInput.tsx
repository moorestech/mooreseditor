import { Group, NumberInput } from "@mantine/core"
import { ComponentProps } from "react"
import { FormWrapper } from '~/components/FormWrapper'

type Props = ComponentProps<typeof NumberInput> & {
  dimensions: number,
  value: Array<number>,
  defaultValue?: Array<number>,
  onChange(value: Array<number>): void;
}

export const VectorInput = ({
  label,
  dimensions,
  onChange,
  ...props
}: Props) => {

  if (!props.value && props.defaultValue) {
    onChange(props.defaultValue);
  }

  const value = props.value ? props.value : new Array(dimensions).fill(null)

  return (
    <FormWrapper label={label}>
      <Group gap='xs' styles={{ root: { flexWrap: 'nowrap' } }} w={100 * dimensions}>
      {new Array(dimensions).fill(null).map((_, i) => (
        <NumberInput
          key={i}
          {...props}
          label={['x', 'y', 'z', 'w'][i]}
          value={value[i]}
          style={{ root: { flexGrow: 1 } }}
          onChange={(newValue: string | number) => {
            onChange(value.map((v, j)=> j == i ? Number(newValue) : v))
          }}
        />
      ))}
      </Group>
    </FormWrapper>
  )
}
