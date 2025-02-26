import { Checkbox } from "@mantine/core"

interface Props {
  value: boolean;
  onChange?(value: boolean): void;
}

export const BooleanInput = ({
  value,
  onChange
}: Props) => {
  return (
    <Checkbox checked={value} onChange={(e) => onChange && onChange(e.currentTarget.checked)} />
  )
}
