import { Select } from "@mantine/core"

interface Props {
  label: string;
  value: string;
  data: string[];
  onChange?(value: string | null): void;
}

export const EnumInput = ({ label, value, data, onChange = (_) => {} }: Props) => {
  return (
    <Select label={label} data={data} value={value} onChange={onChange} />
  )
}
