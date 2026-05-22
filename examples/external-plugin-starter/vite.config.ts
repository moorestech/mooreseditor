import react from "@vitejs/plugin-react";
import { mooresPlugin } from "@mooreseditor/plugin-sdk/vite";
import { defineConfig, mergeConfig } from "vite";

import { pluginMetadata } from "./src/pluginMetadata";

// mooresPlugin() externalizes the host-shared dependencies (react, @mantine/*,
// @mooreseditor/plugin-sdk, etc.) and emits dist/index.js + plugin.json.
// @tauri-apps/* is intentionally NOT external because it is bundled.
export default defineConfig(
  mergeConfig({ plugins: [react()] }, mooresPlugin(pluginMetadata)),
);
