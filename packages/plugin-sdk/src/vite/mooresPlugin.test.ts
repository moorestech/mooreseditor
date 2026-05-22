import { describe, expect, it } from "vitest";

import { createPluginJson, sharedDependencySpecs } from "./mooresPlugin";

describe("mooresPlugin", () => {
  it("generates plugin.json from one metadata object", () => {
    expect(
      createPluginJson({
        id: "node-graph",
        name: "Node Graph",
        version: "0.1.0",
      }),
    ).toEqual({
      id: "node-graph",
      name: "Node Graph",
      version: "0.1.0",
      entry: "dist/index.js",
      styles: ["dist/index.css"],
    });
  });

  it("uses the shared dependency registry for externals", () => {
    expect(sharedDependencySpecs()).toContain("@moorestech/mooreseditor-plugin-sdk");
  });
});
