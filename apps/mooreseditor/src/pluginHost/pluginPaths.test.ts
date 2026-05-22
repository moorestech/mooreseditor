import { describe, expect, it } from "vitest";

import { resolvePluginPackagePath } from "./pluginPaths";

describe("resolvePluginPackagePath", () => {
  it("resolves package-relative paths under the plugin directory", () => {
    expect(
      resolvePluginPackagePath(
        "/project/plugins/node-graph",
        "dist/index.js",
      ),
    ).toBe("/project/plugins/node-graph/dist/index.js");
  });

  it("rejects traversal out of the plugin directory", () => {
    expect(() =>
      resolvePluginPackagePath(
        "/project/plugins/node-graph",
        "../other/index.js",
      ),
    ).toThrow("Invalid plugin file path");
  });

  it("rejects absolute manifest paths", () => {
    expect(() =>
      resolvePluginPackagePath("/project/plugins/node-graph", "/tmp/index.js"),
    ).toThrow("Invalid plugin file path");
  });

  it("rejects empty paths", () => {
    expect(() =>
      resolvePluginPackagePath("/project/plugins/node-graph", ""),
    ).toThrow("Invalid plugin file path");
  });
});
