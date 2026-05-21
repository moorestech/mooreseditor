import { describe, expect, it } from "vitest";

import { assertPluginMetadataMatchesJson } from "./loader";

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
