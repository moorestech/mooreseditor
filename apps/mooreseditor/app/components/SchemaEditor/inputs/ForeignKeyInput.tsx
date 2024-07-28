import { Select } from "@mantine/core"

interface Props {
  label: string;
  value: string;
  data: Array<{ label: string, value: string }>;
  onChange?(value: string | null): void;
}

export const ForeignKeyInput = ({ label, value, data, onChange = (_) => {} }: Props) => {
  return (
    <Select label={label} data={data} value={value} onChange={onChange} w={160} />
  )
}
