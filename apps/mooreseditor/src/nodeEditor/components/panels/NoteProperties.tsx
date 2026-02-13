import { Textarea, Stack, Text } from "@mantine/core";

interface NotePropertiesProps {
  text: string;
  onTextChange: (text: string) => void;
}

export default function NoteProperties({
  text,
  onTextChange,
}: NotePropertiesProps) {
  return (
    <Stack gap="sm">
      <Text size="sm" fw={600}>
        Memo
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
