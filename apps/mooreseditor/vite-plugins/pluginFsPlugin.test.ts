import {
  createSharedDependencyImportMap,
  sharedDependencySpecs,
} from "@moorestech/mooreseditor-plugin-sdk/vite";
import { describe, expect, it } from "vitest";

describe("shared dependency contract", () => {
  it("generates the exact host import map from the SDK registry", () => {
    expect(createSharedDependencyImportMap()).toEqual({
      imports: {
        react: "/shared/react.js",
        "react-dom": "/shared/react-dom.js",
        "react/jsx-runtime": "/shared/react-jsx-runtime.js",
        "@mantine/core": "/shared/mantine-core.js",
        "@mantine/hooks": "/shared/mantine-hooks.js",
        "@mantine/notifications": "/shared/mantine-notifications.js",
        "@tabler/icons-react": "/shared/tabler-icons-react.js",
        "@xyflow/react": "/shared/xyflow-react.js",
        "@moorestech/mooreseditor-plugin-sdk": "/shared/plugin-sdk.js",
      },
    });
  });

  it("exports the Vite external list from the same registry", () => {
    expect(sharedDependencySpecs()).toEqual([
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@mantine/core",
      "@mantine/hooks",
      "@mantine/notifications",
      "@tabler/icons-react",
      "@xyflow/react",
      "@moorestech/mooreseditor-plugin-sdk",
    ]);
  });
});
