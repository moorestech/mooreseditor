import { Stack, Text, Title } from "@mantine/core";

interface HelloPluginViewProps {
  projectDir: string | null;
}

// Minimal view: proves the plugin renders inside the host and that
// host-shared Mantine components resolve to the host's single instance.
export function HelloPluginView({ projectDir }: HelloPluginViewProps) {
  return (
    <Stack p="md" gap="xs">
      <Title order={3}>Hello from an external plugin</Title>
      <Text>This plugin was built in a separate repository.</Text>
      <Text c="dimmed">projectDir: {projectDir ?? "(none)"}</Text>
    </Stack>
  );
}
