import { Button, NumberInput, Stack } from "@mantine/core"
import { ComponentProps } from "react"
import { BsPlusLg } from "react-icons/bs"

type Props = ComponentProps<typeof NumberInput> & {
  value: any[],
  onChange(value: any[]): void;
}

export const ArrayInput = ({
  value,
  onChange,
  ...props
}: Props) => {
  const add = () => {
    onChange([
      ...value,
      ''
    ])
  }
  return (
    <Stack gap='xs'>
      {value.map(eachValue => (
        <NumberInput {...props} value={eachValue} w={160} />
      ))}
      <Button leftSection={<BsPlusLg />} onClick={add} w={160}>追加</Button>
    </Stack>
  )
}
