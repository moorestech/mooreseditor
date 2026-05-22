import { afterEach, describe, expect, it } from "vitest";

import { injectPluginStyleLink, removePluginStyleLinks } from "./pluginStyles";

afterEach(() => {
  document.head.innerHTML = "";
});

describe("pluginStyles", () => {
  it("deduplicates by plugin id and href", () => {
    injectPluginStyleLink("node-graph", "asset://style.css");
    injectPluginStyleLink("node-graph", "asset://style.css");

    expect(
      document.querySelectorAll("link[data-plugin-style='true']"),
    ).toHaveLength(1);
  });

  it("removes only the selected plugin styles", () => {
    injectPluginStyleLink("node-graph", "asset://node.css");
    injectPluginStyleLink("other", "asset://other.css");

    removePluginStyleLinks("node-graph");

    expect(document.querySelector("link[data-plugin-id='node-graph']")).toBeNull();
    expect(document.querySelector("link[data-plugin-id='other']")).not.toBeNull();
  });
});
