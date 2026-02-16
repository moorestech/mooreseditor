import { describe, expect, it } from "vitest";

import { calculateUnlockedItems } from "./spatialUnlock";

import type { Column } from "../../hooks/useJson";
import type { Node as ReactFlowNode } from "@xyflow/react";

/**
 * Helper to create a minimal research node for testing.
 */
function makeResearch(
  id: string,
  x: number,
  y: number,
  masterGuid?: string,
): ReactFlowNode {
  return {
    id,
    type: "research",
    position: { x, y },
    data: { masterGuid: masterGuid ?? id },
  };
}

/**
 * Helper to create a minimal item node for testing.
 * For item nodes, getItemGuidForNode returns data.masterGuid directly,
 * so no jsonData/schemaMeta lookup is needed.
 */
function makeItem(
  id: string,
  x: number,
  y: number,
  masterGuid?: string,
): ReactFlowNode {
  return {
    id,
    type: "item",
    position: { x, y },
    data: { masterGuid: masterGuid ?? id },
  };
}

// For item-type nodes, jsonData and schemaMetas are not used.
const emptyColumns: Column[] = [];
const emptyMetas = new Map();

describe("calculateUnlockedItems", () => {
  it("returns empty map when no research nodes exist", () => {
    const items = [makeItem("i1", 100, 100)];
    const result = calculateUnlockedItems([], items, emptyColumns, emptyMetas);
    expect(result.size).toBe(0);
  });

  it("returns empty arrays when no items exist", () => {
    const research = [makeResearch("r1", 0, 0)];
    const result = calculateUnlockedItems(
      research,
      [],
      emptyColumns,
      emptyMetas,
    );
    expect(result.get("r1")).toEqual([]);
  });

  describe("right zone", () => {
    it("includes items to the right of research node", () => {
      const research = [makeResearch("r1", 0, 0)];
      const items = [makeItem("i1", 200, 0), makeItem("i2", 200, 100)];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual(["i1", "i2"]);
    });

    it("excludes items to the left of research node", () => {
      const research = [makeResearch("r1", 300, 0)];
      const items = [makeItem("i1", 100, 0)];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual([]);
    });

    it("excludes items at the same x as research node", () => {
      const research = [makeResearch("r1", 100, 0)];
      const items = [makeItem("i1", 100, 0)];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual([]);
    });

    it("is bounded by the nearest research node to the right", () => {
      const research = [
        makeResearch("r1", 0, 0),
        makeResearch("r2", 400, 0),
      ];
      const items = [
        makeItem("i1", 200, 0), // between r1 and r2
        makeItem("i2", 500, 0), // past r2
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual(["i1"]);
      expect(result.get("r2")).toEqual(["i2"]);
    });
  });

  describe("below zone", () => {
    it("includes items below research node with x <= research.x", () => {
      const research = [makeResearch("r1", 200, 0)];
      const items = [
        makeItem("i1", 200, 300), // same x, below
        makeItem("i2", 100, 300), // left of x, below
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual(["i1", "i2"]);
    });

    it("excludes items above research node", () => {
      const research = [makeResearch("r1", 200, 400)];
      const items = [makeItem("i1", 200, 100)]; // above
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual([]);
    });

    it("excludes items at the same y as research node from below zone", () => {
      const research = [makeResearch("r1", 200, 100)];
      // same y and x <= research.x → not in below zone (requires y > r.y)
      // also not in right zone (x is not > r.x)
      const items = [makeItem("i1", 200, 100)];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual([]);
    });

    it("is bounded by the nearest research node below", () => {
      const research = [
        makeResearch("r1", 200, 0),
        makeResearch("r2", 200, 400),
      ];
      const items = [
        makeItem("i1", 200, 200), // between r1 and r2 (below zone of r1)
        makeItem("i2", 200, 500), // past r2 (below zone of r2)
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual(["i1"]);
      expect(result.get("r2")).toEqual(["i2"]);
    });

    it("does not include items with x > research.x in below zone", () => {
      const research = [makeResearch("r1", 200, 0)];
      // x > r.x and y > r.y → this falls in right zone, not below zone
      // but still gets included via right zone
      const items = [makeItem("i1", 300, 300)];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      // Should be in right zone (x > 200, y >= 0)
      expect(result.get("r1")).toEqual(["i1"]);
    });
  });

  describe("combined zones", () => {
    it("collects items from both right zone and below zone", () => {
      const research = [makeResearch("r1", 200, 200)];
      const items = [
        makeItem("right1", 400, 200), // right zone (x > 200, y >= 200)
        makeItem("below1", 100, 400), // below zone (y > 200, x <= 200)
        makeItem("below2", 200, 300), // below zone (y > 200, x <= 200)
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      const unlocked = result.get("r1")!;
      expect(unlocked).toContain("right1");
      expect(unlocked).toContain("below1");
      expect(unlocked).toContain("below2");
      expect(unlocked).toHaveLength(3);
    });

    it("excludes items outside both zones", () => {
      const research = [makeResearch("r1", 200, 200)];
      const items = [
        makeItem("i1", 100, 100), // above and left → neither zone
        makeItem("i2", 100, 200), // same y and left → neither zone
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual([]);
    });
  });

  describe("deduplication", () => {
    it("deduplicates items with the same masterGuid", () => {
      const research = [makeResearch("r1", 200, 200)];
      const items = [
        makeItem("i1a", 400, 200, "shared-guid"), // right zone
        makeItem("i1b", 100, 400, "shared-guid"), // below zone, same guid
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual(["shared-guid"]);
    });
  });

  describe("multiple research nodes", () => {
    it("each research node independently collects its unlocked items", () => {
      const research = [
        makeResearch("r1", 0, 0),
        makeResearch("r2", 800, 0),
      ];
      const items = [
        makeItem("i1", 200, 0), // right of r1, left of r2
        makeItem("i2", 1000, 0), // right of r2
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual(["i1"]);
      expect(result.get("r2")).toEqual(["i2"]);
    });

    it("below boundary works with stacked research nodes", () => {
      //  r1 at (0, 0)
      //  r2 at (0, 400)
      //  item at (0, 200) → below r1, above r2 → only r1
      //  item at (0, 500) → below r2 → only r2
      const research = [
        makeResearch("r1", 0, 0),
        makeResearch("r2", 0, 400),
      ];
      const items = [
        makeItem("i1", 0, 200), // below r1, bounded by r2
        makeItem("i2", 0, 500), // below r2
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual(["i1"]);
      expect(result.get("r2")).toEqual(["i2"]);
    });
  });
});
