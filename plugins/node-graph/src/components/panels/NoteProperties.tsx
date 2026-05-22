import { ColorInput, Textarea, Stack, Text } from "@mantine/core";

import { normalizeNoteColor } from "../../utils/noteColor";

interface NotePropertiesProps {
  text: string;
  onTextChange: (text: string) => void;
  label?: string;
  color?: string;
  showColorPicker?: boolean;
  onColorChange?: (color: string) => void;
}

export default function NoteProperties({
  text,
  onTextChange,
  label = "Memo",
  color,
  showColorPicker = false,
  onColorChange,
}: NotePropertiesProps) {
  const noteColor = normalizeNoteColor(color);

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
      {showColorPicker ? (
        <Stack gap={4}>
          <Text size="sm" fw={600}>
            Color
          </Text>
          <ColorInput
            aria-label={`${label} color picker`}
            value={noteColor}
            onChange={(value) => onColorChange?.(value)}
            format="hex"
            disallowInput
            withEyeDropper={false}
            swatches={[
              "#FFFACD",
              "#FFD6A5",
              "#FDFFB6",
              "#CAFFBF",
              "#9BF6FF",
              "#A0C4FF",
              "#BDB2FF",
              "#FFC6FF",
              "#FFADAD",
              "#E9ECEF",
            ]}
          />
        </Stack>
      ) : null}
    </Stack>
  );
}
