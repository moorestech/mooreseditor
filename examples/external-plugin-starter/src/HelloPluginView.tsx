import { Stack, Text, Title } from "@mantine/core";
import { useMemo } from "react";

interface HelloPluginViewProps {
  projectDir: string | null;
  sdkBridgeReady: boolean;
}

// Minimal view: proves the plugin renders inside the host and that
// host-shared Mantine components resolve to the host's single instance.
export function HelloPluginView({
  projectDir,
  sdkBridgeReady,
}: HelloPluginViewProps) {
  const bridgeStatus = useMemo(
    () => (sdkBridgeReady ? "ready" : "missing"),
    [sdkBridgeReady],
  );

  return (
    <Stack p="md" gap="xs">
      <Title order={3}>Hello from an external plugin</Title>
      <Text>This plugin was built in a separate repository.</Text>
      <Text c="dimmed">projectDir: {projectDir ?? "(none)"}</Text>
      <Text c="dimmed">SDK bridge: {bridgeStatus}</Text>
    </Stack>
  );
}
