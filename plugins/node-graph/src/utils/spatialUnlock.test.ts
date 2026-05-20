import { describe, expect, it } from "vitest";

import { calculateUnlockedItems } from "./spatialUnlock";

import type { Column } from "@mooreseditor/plugin-sdk";
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
      const research = [makeResearch("r1", 0, 0), makeResearch("r2", 400, 0)];
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
    it("includes items directly below research node (same x)", () => {
      const research = [makeResearch("r1", 200, 0)];
      const items = [
        makeItem("i1", 200, 300), // same x, below
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual(["i1"]);
    });

    it("excludes items to the left of all research from below zone", () => {
      const research = [makeResearch("r1", 200, 0)];
      const items = [
        makeItem("i1", 100, 300), // left of all research
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual([]);
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
        makeItem("below1", 200, 400), // below zone (y > 200, x == 200)
        makeItem("below2", 200, 300), // below zone (y > 200, x == 200)
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
      const research = [makeResearch("r1", 0, 0), makeResearch("r2", 800, 0)];
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
      const research = [makeResearch("r1", 0, 0), makeResearch("r2", 0, 400)];
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

  describe("bounding-box priority: right zone over below zone", () => {
    it("assigns item to right-zone research even when below-zone research is closer by distance", () => {
      const research = [
        makeResearch("r1", -840, 0, "原始研究1"),
        makeResearch("r2", -200, 20, "原始研究2"),
        makeResearch("r3", 240, 20, "原始研究3"),
        makeResearch("r4", 700, 20, "原始研究4"),
      ];
      const items = [
        makeItem("stone-axe", 40, 160, "石の斧"),
        makeItem("wind-miner", 460, 160, "風力掘削機"),
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("原始研究2")).toContain("石の斧");
      expect(result.get("原始研究3")).not.toContain("石の斧");
      expect(result.get("原始研究3")).toEqual(["風力掘削機"]);
    });

    it("falls back to below zone only when no right-zone match exists", () => {
      const research = [
        makeResearch("r1", -840, 0, "原始研究1"),
        makeResearch("r2", -200, 20, "原始研究2"),
      ];
      const items = [makeItem("far-left-item", -2180, 100, "遠い左アイテム")];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      // Items to the left of all research should remain unassigned
      expect(result.get("原始研究1")).toEqual([]);
      expect(result.get("原始研究2")).toEqual([]);
    });

    it("handles full 原始研究 chain layout correctly", () => {
      const research = [
        makeResearch("r1", -840, 0, "原始研究1"),
        makeResearch("r2", -200, 20, "原始研究2"),
        makeResearch("r3", 240, 20, "原始研究3"),
        makeResearch("r4", 700, 20, "原始研究4"),
      ];
      const items = [
        makeItem("i-far-left-1", -2180, 100, "item-far-left-1"),
        makeItem("i-far-left-2", -1040, 120, "item-far-left-2"),
        makeItem("i-r1-right", -680, 160, "item-r1-right"),
        makeItem("i-between-r1-r2", -440, 160, "item-between"),
        makeItem("i-stone-axe", 40, 160, "stone-axe"),
        makeItem("i-wind-miner", 460, 160, "wind-miner"),
        makeItem("i-r4-right", 860, 140, "item-r4-right"),
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      // Items to the right of R1 are assigned to R1
      expect(result.get("原始研究1")).toContain("item-r1-right");
      expect(result.get("原始研究1")).toContain("item-between");
      // Far-left items (x < minResearchX=-840) are NOT assigned
      expect(result.get("原始研究1")).not.toContain("item-far-left-1");
      expect(result.get("原始研究1")).not.toContain("item-far-left-2");
      expect(result.get("原始研究1")).toHaveLength(2);
      expect(result.get("原始研究2")).toEqual(["stone-axe"]);
      expect(result.get("原始研究3")).toEqual(["wind-miner"]);
      expect(result.get("原始研究4")).toEqual(["item-r4-right"]);
    });
  });

  describe("real-world scenario: nodeGraph.v1.json layout", () => {
    it("assigns items to nearest eligible research (iron ingot bug fix)", () => {
      // Reproduces the actual node layout from nodeGraph.v1.json:
      //   R1 "低品質鉄の加工" at (140, 20)
      //   R2 "鉄インゴット" at (860, 0)
      //   R3 "鉄の加工" at (900, 340)
      //   R4 "砂鉄" at (560, 180)
      //   I1 "低品質鉄塊" at (340, 160)
      //   I2 "鉄インゴット" at (1060, 120)
      //   I3 "鉄板" at (1060, 420)
      //   I4 "砂鉄" at (680, 280)
      const research = [
        makeResearch("r1", 140, 20, "low-quality-iron-research"),
        makeResearch("r2", 860, 0, "iron-ingot-research"),
        makeResearch("r3", 900, 340, "iron-processing-research"),
        makeResearch("r4", 560, 180, "sand-iron-research"),
      ];
      const items = [
        makeItem("i1", 340, 160, "low-quality-iron-item"),
        makeItem("i2", 1060, 120, "iron-ingot-item"),
        makeItem("i3", 1060, 420, "iron-plate-item"),
        makeItem("i4", 680, 280, "sand-iron-item"),
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );

      // R1 should unlock the item to its right: 低品質鉄塊
      expect(result.get("low-quality-iron-research")).toEqual([
        "low-quality-iron-item",
      ]);
      // R2 should unlock the item to its right: 鉄インゴット
      expect(result.get("iron-ingot-research")).toEqual(["iron-ingot-item"]);
      // R3 should unlock the item to its right: 鉄板
      expect(result.get("iron-processing-research")).toEqual([
        "iron-plate-item",
      ]);
      // R4 should unlock the item to its right: 砂鉄
      expect(result.get("sand-iron-research")).toEqual(["sand-iron-item"]);
    });

    it("does not assign far-left items to a right-side research via below zone", () => {
      // R2 at (860, 0) should NOT pick up I1 at (340, 160) just because
      // I1 is below R2 and x <= 860 — I1 is much closer to R1 at (140, 20)
      const research = [
        makeResearch("r1", 140, 20),
        makeResearch("r2", 860, 0),
      ];
      const items = [makeItem("i1", 340, 160)];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r1")).toEqual(["i1"]);
      expect(result.get("r2")).toEqual([]);
    });

    it("does not block right-zone items by a distant below research node", () => {
      // R2 at (860, 0) has R3 at (900, 340) to its right but far below.
      // R3 should NOT prevent I2 at (1060, 120) from being assigned to R2
      // because I2 is much closer to R2 than to R3.
      const research = [
        makeResearch("r2", 860, 0),
        makeResearch("r3", 900, 340),
      ];
      const items = [
        makeItem("i2", 1060, 120), // right of both, but closest to R2
        makeItem("i3", 1060, 420), // right of both, but closest to R3
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      expect(result.get("r2")).toEqual(["i2"]);
      expect(result.get("r3")).toEqual(["i3"]);
    });
  });

  describe("bug: items near 木材の組み立て stolen by 燃料式風車の作成", () => {
    it("assigns items to nearest research by distance, not max R.x", () => {
      // 木材の組み立て at (6400, 340) and 燃料式風車の作成 at (6480, -160)
      // Items at (6580-6900, 560-700) should belong to 木材の組み立て (nearby)
      // not 燃料式風車の作成 (slightly larger x but 800px above)
      const research = [
        makeResearch("r-wood", 6400, 340, "木材の組み立て"),
        makeResearch("r-windmill", 6480, -160, "燃料式風車の作成"),
      ];
      const items = [
        makeItem("i-reinforced", 6580, 640, "補強棒材"),
        makeItem("i-assembler", 6900, 560, "木材組立機"),
        makeItem("i-frame", 6900, 700, "木のフレーム"),
      ];
      const result = calculateUnlockedItems(
        research,
        items,
        emptyColumns,
        emptyMetas,
      );
      // All three should be assigned to 木材の組み立て, NOT 燃料式風車の作成
      const woodUnlocks = result.get("木材の組み立て")!;
      expect(woodUnlocks).toContain("補強棒材");
      expect(woodUnlocks).toContain("木材組立機");
      expect(woodUnlocks).toContain("木のフレーム");
      expect(woodUnlocks).toHaveLength(3);
      expect(result.get("燃料式風車の作成")).toEqual([]);
    });
  });

  describe("full nodeGraph.v1.json integration: all real positions", () => {
    // All research nodes from nodeGraph.v1.json with exact positions
    const allResearch = [
      makeResearch("r-原始研究1", -840, 0, "原始研究1"),
      makeResearch("r-原始研究2", -200, 20, "原始研究2"),
      makeResearch("r-原始研究3", 240, 40, "原始研究3"),
      makeResearch("r-原始研究4", 700, 20, "原始研究4"),
      makeResearch("r-原始研究5", 1260, 0, "原始研究5"),
      makeResearch("r-原始研究6", 1820, 0, "原始研究6"),
      makeResearch("r-原始研究7", 2420, -40, "原始研究7"),
      makeResearch("r-燃料式風車", 3100, -240, "燃料式風車の作成"),
      makeResearch("r-軸の変更", 3280, 280, "軸の変更"),
      makeResearch(
        "r-原始ロジスティクス",
        3840,
        -260,
        "原始ロジスティクス改善",
      ),
      makeResearch("r-建築土台", 3840, 280, "建築土台"),
      makeResearch("r-合板の作成", 4400, -260, "合板の作成"),
      makeResearch("r-新しい燃料", 4400, 300, "新しい燃料"),
    ];

    // All item nodes from nodeGraph.v1.json with exact positions and masterGuids
    const allItems = [
      makeItem("i1", -2180, 100, "582040ec"),
      makeItem("i2", -1860, 100, "76174235"),
      makeItem("i3", -1620, 180, "aafce615"),
      makeItem("i4", -1300, 200, "585f5d0b"),
      makeItem("i5", -1040, 120, "ef4223f8"),
      makeItem("i6", -780, 180, "44aaddd6"),
      makeItem("i7", -420, 180, "60daab46"),
      makeItem("i8", 40, 160, "4c5fefbd"), // 石の斧
      makeItem("i9", 460, 200, "3a60a5d1"), // 風力掘削機
      makeItem("i10", 860, 140, "71b9c6a0"),
      makeItem("i11", 940, 240, "f7cde28a"),
      makeItem("i12", 980, 320, "24a63965"),
      makeItem("i13", 1460, 140, "6aa2962b"),
      makeItem("i14", 1480, 240, "3177a8c4"),
      makeItem("i15", 2020, 100, "3b2a5fd9"),
      makeItem("i16", 2020, 220, "c68bcdf5"),
      makeItem("i17", 2600, 140, "567ba546"),
      makeItem("i18", 3220, -100, "a3cada69"),
      makeItem("i19", 3440, 400, "e132cf99"),
      makeItem("i20", 3440, 460, "cf749d82"),
      makeItem("i21", 4040, -60, "cdcd04b4"),
      makeItem("i22", 4020, 420, "a58e1f02"),
      makeItem("i23", 4600, 420, "05c58e99"),
      makeItem("i24", 4600, 480, "be7b32ed"),
    ];

    it("assigns every item to the correct research matching research.json", () => {
      const result = calculateUnlockedItems(
        allResearch,
        allItems,
        emptyColumns,
        emptyMetas,
      );

      // 原始研究1: only 2 items to its RIGHT (Pass 1)
      // Leftmost 5 items (x < -840) are NOT assigned (they belong to ダミー研究)
      const r1 = result.get("原始研究1")!;
      expect(r1).toContain("44aaddd6");
      expect(r1).toContain("60daab46");
      expect(r1).toHaveLength(2);

      // 原始研究2: 石の斧 only
      expect(result.get("原始研究2")).toEqual(["4c5fefbd"]);

      // 原始研究3: 風力掘削機 only
      expect(result.get("原始研究3")).toEqual(["3a60a5d1"]);

      // 原始研究4: 3 items
      const r4 = result.get("原始研究4")!;
      expect(r4).toContain("71b9c6a0");
      expect(r4).toContain("f7cde28a");
      expect(r4).toContain("24a63965");
      expect(r4).toHaveLength(3);

      // 原始研究5: 2 items
      const r5 = result.get("原始研究5")!;
      expect(r5).toContain("6aa2962b");
      expect(r5).toContain("3177a8c4");
      expect(r5).toHaveLength(2);

      // 原始研究6: 2 items
      const r6 = result.get("原始研究6")!;
      expect(r6).toContain("c68bcdf5");
      expect(r6).toContain("3b2a5fd9");
      expect(r6).toHaveLength(2);

      // 原始研究7: 1 item
      expect(result.get("原始研究7")).toEqual(["567ba546"]);

      // 燃料式風車の作成: 1 item
      expect(result.get("燃料式風車の作成")).toEqual(["a3cada69"]);

      // 軸の変更: 2 items
      const rAxis = result.get("軸の変更")!;
      expect(rAxis).toContain("e132cf99");
      expect(rAxis).toContain("cf749d82");
      expect(rAxis).toHaveLength(2);

      // 原始ロジスティクス改善: 1 item
      expect(result.get("原始ロジスティクス改善")).toEqual(["cdcd04b4"]);

      // 建築土台: 1 item
      expect(result.get("建築土台")).toEqual(["a58e1f02"]);

      // 合板の作成: empty
      expect(result.get("合板の作成")).toEqual([]);

      // 新しい燃料: 2 items
      const rFuel = result.get("新しい燃料")!;
      expect(rFuel).toContain("be7b32ed");
      expect(rFuel).toContain("05c58e99");
      expect(rFuel).toHaveLength(2);
    });
  });
});
