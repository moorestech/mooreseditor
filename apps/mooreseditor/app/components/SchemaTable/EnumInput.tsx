import { Select } from "@mantine/core"

interface Props {
  value: string;
  data: string[];
  onChange?(value: string | null): void;
}

export const EnumInput = ({ value, data, onChange = (_) => {} }: Props) => {
  return (
    <Select data={data} value={value} onChange={onChange} />
  )
}
