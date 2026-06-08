import { describe, expect, it } from "vitest";

import {
  assertPluginDirSupportedByAssetScope,
  assertPluginMetadataMatchesJson,
  resolvePluginDir,
} from "./loader";

describe("assertPluginDirSupportedByAssetScope", () => {
  it("accepts a top-level plugins/<name> directory", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope("plugins/node-graph"),
    ).not.toThrow();
  });

  it("accepts a relative path whose final directory is under plugins/<name>", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope(
        "./../mooreseditor/plugins/states-node-editor",
      ),
    ).not.toThrow();
  });

  it("accepts nested parent paths when the plugin itself is directly under plugins", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope("extensions/plugins/node-graph"),
    ).not.toThrow();
  });

  it("accepts dot-directory parent paths when the plugin itself is directly under plugins", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope(".mooreseditor/plugins/node-graph"),
    ).not.toThrow();
  });

  it("rejects directories nested inside a plugin directory", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope("plugins/node-graph/extra"),
    ).toThrow(/plugins\/<name>/);
  });

  it("rejects absolute plugin paths", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope("/tmp/plugins/node-graph"),
    ).toThrow("Invalid plugin dir");
  });
});

describe("resolvePluginDir", () => {
  it("resolves an accepted relative plugin path without rejecting traversal", async () => {
    await expect(
      resolvePluginDir(
        "/Users/katsumi/WebstormProjects/example",
        "./../mooreseditor/plugins/states-node-editor",
      ),
    ).resolves.toBe(
      "/Users/katsumi/WebstormProjects/example/./../mooreseditor/plugins/states-node-editor",
    );
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
