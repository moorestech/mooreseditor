import { Textarea, Stack, Text } from "@mantine/core";

interface NotePropertiesProps {
  text: string;
  onTextChange: (text: string) => void;
  label?: string;
}

export default function NoteProperties({
  text,
  onTextChange,
  label = "Memo",
}: NotePropertiesProps) {
  return (
    <Stack gap="sm">
      <Text size="sm" fw={600}>
        {label}
      </Text>
      <Textarea
        value={text}
        onChange={(e) => onTextChange(e.currentTarget.value)}
        placeholder="Enter memo text..."
        autosize
        minRows={3}
        maxRows={10}
      />
    </Stack>
  );
}
