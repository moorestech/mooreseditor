import { describe, expect, it } from "vitest";

import {
  buildResearchDependencyMap,
  patchResearchColumn,
} from "./exportToMasterResearchPatch";

import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from "@xyflow/react";

function makeResearchNode(id: string, masterGuid: string): ReactFlowNode {
  return {
    id,
    type: "research",
    position: { x: 0, y: 0 },
    data: { masterGuid },
  };
}

function makeDependencyEdge(
  id: string,
  source: string,
  target: string,
): ReactFlowEdge {
  return {
    id,
    source,
    target,
    data: { edgeType: "dependency" },
  };
}

function makeSchemaMeta(schemaId: string): SchemaMeta {
  return {
    schemaId,
    guidField: "guid",
    nameField: "name",
    dataArrayPath: "entries",
    elementSchema: null,
  };
}

describe("buildResearchDependencyMap", () => {
  it("deduplicates repeated dependency edges for the same research pair", () => {
    const nodes = [
      makeResearchNode("source", "source-guid"),
      makeResearchNode("target", "target-guid"),
    ];
    const edges = [
      makeDependencyEdge("edge-1", "source", "target"),
      makeDependencyEdge("edge-2", "source", "target"),
    ];

    expect(buildResearchDependencyMap(nodes, edges).get("target-guid")).toEqual(
      ["source-guid"],
    );
  });

  it("excludes dependency self loops", () => {
    const nodes = [makeResearchNode("research", "research-guid")];
    const edges = [
      makeDependencyEdge("self-loop", "research", "research"),
    ];

    expect(buildResearchDependencyMap(nodes, edges).size).toBe(0);
  });
});

describe("patchResearchColumn", () => {
  it("overwrites removed dependencies with an empty array", () => {
    const columns: Column[] = [
      {
        title: "researchs",
        data: {
          entries: [
            {
              guid: "research-guid",
              name: "Research",
              prevResearchNodeGuids: ["stale-guid"],
            },
          ],
        },
      },
    ];
    const schemaMetas = new Map([["researchs", makeSchemaMeta("researchs")]]);

    const result = patchResearchColumn(
      columns,
      [makeResearchNode("research", "research-guid")],
      new Map(),
      new Map(),
      schemaMetas,
      new Set(),
    );

    expect(
      result[0].data.entries[0].prevResearchNodeGuids,
    ).toEqual([]);
  });

  it("resolves the research schema id dynamically", () => {
    const columns: Column[] = [
      {
        title: "researchs",
        data: {
          entries: [
            {
              guid: "target-guid",
              name: "Target",
              prevResearchNodeGuids: [],
            },
          ],
        },
      },
    ];
    const schemaMetas = new Map([["researchs", makeSchemaMeta("researchs")]]);
    const dependencyMap = new Map([["target-guid", ["source-guid"]]]);

    const result = patchResearchColumn(
      columns,
      [makeResearchNode("target", "target-guid")],
      dependencyMap,
      new Map(),
      schemaMetas,
      new Set(),
    );

    expect(result[0].data.entries[0].prevResearchNodeGuids).toEqual([
      "source-guid",
    ]);
  });

  it("regenerates unlock actions per kind and preserves other actions", () => {
    const columns: Column[] = [
      {
        title: "researchs",
        data: {
          entries: [
            {
              guid: "research-guid",
              name: "Research",
              prevResearchNodeGuids: [],
              clearedActions: [
                {
                  gameActionType: "unlockItemRecipeView",
                  gameActionParam: { unlockItemGuids: ["stale-item"] },
                },
                {
                  gameActionType: "unlockBlock",
                  gameActionParam: { unlockBlockGuids: ["stale-block"] },
                },
                {
                  gameActionType: "giveItem",
                  gameActionParam: { itemGuid: "gift" },
                },
              ],
            },
          ],
        },
      },
    ];
    const schemaMetas = new Map([["researchs", makeSchemaMeta("researchs")]]);
    const unlockMap = new Map([
      [
        "research-guid",
        {
          unlockItemGuids: ["new-item"],
          unlockBlockGuids: ["new-block"],
          unlockTrainCarGuids: [],
        },
      ],
    ]);

    const result = patchResearchColumn(
      columns,
      [makeResearchNode("research", "research-guid")],
      new Map(),
      unlockMap,
      schemaMetas,
      new Set(["item", "block", "train"] as const),
    );

    expect(result[0].data.entries[0].clearedActions).toEqual([
      {
        gameActionType: "giveItem",
        gameActionParam: { itemGuid: "gift" },
      },
      {
        gameActionType: "unlockItemRecipeView",
        gameActionParam: { unlockItemGuids: ["new-item"] },
      },
      {
        gameActionType: "unlockBlock",
        gameActionParam: { unlockBlockGuids: ["new-block"] },
      },
    ]);
  });

  it("keeps existing unlock actions for kinds outside activeKinds", () => {
    const columns: Column[] = [
      {
        title: "researchs",
        data: {
          entries: [
            {
              guid: "research-guid",
              name: "Research",
              prevResearchNodeGuids: [],
              clearedActions: [
                {
                  gameActionType: "unlockTrainCar",
                  gameActionParam: { unlockTrainCarGuids: ["hand-authored"] },
                },
              ],
            },
          ],
        },
      },
    ];
    const schemaMetas = new Map([["researchs", makeSchemaMeta("researchs")]]);

    const result = patchResearchColumn(
      columns,
      [makeResearchNode("research", "research-guid")],
      new Map(),
      new Map(),
      schemaMetas,
      new Set(["item", "block"] as const),
    );

    // trainカラム未ロード時は手動投入のunlockTrainCarを消さない
    // Hand-authored unlockTrainCar survives when train column isn't loaded
    expect(result[0].data.entries[0].clearedActions).toEqual([
      {
        gameActionType: "unlockTrainCar",
        gameActionParam: { unlockTrainCarGuids: ["hand-authored"] },
      },
    ]);
  });
});
