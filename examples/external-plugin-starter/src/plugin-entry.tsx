import { HelloPluginView } from "./HelloPluginView";
import { pluginMetadata } from "./pluginMetadata";

import type {
  HostAPI,
  PluginManifest,
  PluginView,
} from "@mooreseditor/plugin-sdk";

const manifest: PluginManifest = {
  ...pluginMetadata,
  createView(host: HostAPI): PluginView {
    return {
      render: () => <HelloPluginView projectDir={host.projectDir} />,
      // Read-only view: declare not-dirty so the host save button stays
      // inactive instead of defaulting to always-savable.
      isDirty: () => false,
    };
  },
};

export default manifest;
