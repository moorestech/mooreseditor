import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import manifest from "./plugin-entry";

import type { Column, HostAPI } from "@moorestech/mooreseditor-plugin-sdk";

vi.mock("./index", () => ({
  default: ({ ref, onRequestSave }: any): null => {
    ref({
      save: () =>
        onRequestSave([{ title: "items", data: { data: [] } }], {
          version: 1,
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        }),
      focusSearchMatch: () => false,
    });
    return null;
  },
}));

describe("node-graph plugin save", () => {
  it("rejects when host.saveProject rejects", async () => {
    const saveError = new Error("disk full");
    const columns: Column[] = [{ title: "items", data: { data: [] } }];
    const host = {
      getColumns: () => columns,
      setColumns: vi.fn(),
      schemas: {},
      loadSchema: vi.fn(),
      projectDir: "/project",
      masterDir: "/project/master",
      markDirty: vi.fn(),
      saveExtraFile: vi.fn(),
      readExtraFile: vi.fn(),
      saveProject: vi.fn().mockRejectedValue(saveError),
    } as unknown as HostAPI;

    const view = manifest.createView(host);
    render(view.render());

    await expect(view.save?.()).rejects.toThrow("disk full");
  });
});
