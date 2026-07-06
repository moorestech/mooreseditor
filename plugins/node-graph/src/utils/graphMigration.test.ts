import { describe, expect, it, vi } from "vitest";

import { validateAndMigrate } from "./graphMigration";

describe("validateAndMigrate", () => {
  it("removes item, block, and research nodes without a non-empty masterGuid", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = validateAndMigrate({
      version: 1,
      viewport: { x: 10, y: 20, zoom: 1.5 },
      nodes: [
        { id: "item-1", type: "item", position: { x: 0, y: 0 } },
        { id: "note-1", type: "note", position: { x: 10, y: 10 }, text: "" },
      ],
      edges: [],
    });

    expect(result?.nodes.map((node) => node.id)).toEqual(["note-1"]);
    expect(warn).toHaveBeenCalled();
  });

  it("removes edges connected to nodes filtered out during migration", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = validateAndMigrate({
      version: 1,
      nodes: [
        { id: "item-1", type: "item", position: { x: 0, y: 0 } },
        {
          id: "research-1",
          type: "research",
          masterGuid: "research-guid",
          position: { x: 10, y: 10 },
        },
      ],
      edges: [
        {
          id: "edge-1",
          source: "item-1",
          target: "research-1",
          edgeType: "visual",
        },
      ],
    });

    expect(result?.nodes.map((node) => node.id)).toEqual(["research-1"]);
    expect(result?.edges).toEqual([]);
  });

  it("leaves a valid graph unchanged", () => {
    const graph = {
      version: 1,
      viewport: { x: 10, y: 20, zoom: 1.5 },
      nodes: [
        {
          id: "item-1",
          type: "item",
          masterGuid: "item-guid",
          position: { x: 0, y: 0 },
        },
        {
          id: "research-1",
          type: "research",
          masterGuid: "research-guid",
          position: { x: 10, y: 10 },
        },
      ],
      edges: [
        {
          id: "edge-1",
          source: "item-1",
          target: "research-1",
          edgeType: "visual",
        },
      ],
    };

    expect(validateAndMigrate(graph)).toEqual(graph);
  });
});
