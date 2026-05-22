import { describe, expect, it } from "vitest";

import {
  assertPluginDirSupportedByAssetScope,
  assertPluginMetadataMatchesJson,
} from "./loader";

describe("assertPluginDirSupportedByAssetScope", () => {
  it("accepts a top-level plugins/<name> directory", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope("plugins/node-graph"),
    ).not.toThrow();
  });

  it("rejects nested plugin directories that production asset scope cannot serve", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope("extensions/plugins/node-graph"),
    ).toThrow(/plugins\/<name>/);
  });

  it("rejects dot-directory plugin paths that production asset scope cannot serve", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope(".mooreseditor/plugins/node-graph"),
    ).toThrow(/plugins\/<name>/);
  });
});

describe("assertPluginMetadataMatchesJson", () => {
  it("accepts matching plugin.json and runtime manifest metadata", () => {
    expect(() =>
      assertPluginMetadataMatchesJson(
        {
          id: "node-graph",
          name: "Node Graph",
          version: "0.1.0",
          entry: "dist/index.js",
        },
        {
          id: "node-graph",
          name: "Node Graph",
          version: "0.1.0",
          createView: () => ({ render: () => null }),
        },
        "plugins/node-graph",
      ),
    ).not.toThrow();
  });

  it("rejects mismatched plugin.json and runtime manifest metadata", () => {
    expect(() =>
      assertPluginMetadataMatchesJson(
        {
          id: "node-graph",
          name: "Node Graph",
          version: "0.1.0",
          entry: "dist/index.js",
        },
        {
          id: "other",
          name: "Node Graph",
          version: "0.1.0",
          createView: () => ({ render: () => null }),
        },
        "plugins/node-graph",
      ),
    ).toThrow("plugin.json metadata does not match runtime manifest");
  });
});
