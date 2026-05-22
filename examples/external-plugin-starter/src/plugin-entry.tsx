import { HelloPluginView } from "./HelloPluginView";
import { pluginMetadata } from "./pluginMetadata";

import { createColumnDispatch } from "@mooreseditor/plugin-sdk";

import type {
  HostAPI,
  PluginManifest,
  PluginView,
} from "@mooreseditor/plugin-sdk";

const manifest: PluginManifest = {
  ...pluginMetadata,
  createView(host: HostAPI): PluginView {
    const setColumns = createColumnDispatch(host);

    return {
      render: () => (
        <HelloPluginView
          projectDir={host.projectDir}
          sdkBridgeReady={typeof setColumns === "function"}
        />
      ),
      // Read-only view: declare not-dirty so the host save button stays
      // inactive instead of defaulting to always-savable.
      isDirty: () => false,
    };
  },
};

export default manifest;
