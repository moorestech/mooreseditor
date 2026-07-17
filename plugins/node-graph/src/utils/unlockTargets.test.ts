import { describe, expect, it } from "vitest";

import { buildUnlockGuidIndex, resolveUnlockRef } from "./unlockTargets";

import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";
import type { Node as ReactFlowNode } from "@xyflow/react";

function makeMeta(
  schemaId: string,
  guidField: string,
  dataArrayPath: string,
): SchemaMeta {
  return {
    schemaId,
    guidField,
    nameField: "name",
    dataArrayPath,
    elementSchema: null,
  };
}

function makeColumnsAndMetas(): {
  columns: Column[];
  metas: Map<string, SchemaMeta>;
} {
  return {
    columns: [
      {
        title: "items",
        data: { data: [{ itemGuid: "item-1" }, { itemGuid: "item-2" }] },
      },
      { title: "blocks", data: { data: [{ blockGuid: "block-1" }] } },
      { title: "train", data: { trainCars: [{ trainCarGuid: "train-1" }] } },
    ],
    metas: new Map([
      ["items", makeMeta("items", "itemGuid", "data")],
      ["blocks", makeMeta("blocks", "blockGuid", "data")],
      ["train", makeMeta("train", "trainCarGuid", "trainCars")],
    ]),
  };
}

function makeNode(type: string, masterGuid: string): ReactFlowNode {
  return { id: "n1", type, position: { x: 0, y: 0 }, data: { masterGuid } };
}

describe("buildUnlockGuidIndex", () => {
  it("collects guids per kind from item/block/train columns", () => {
    const { columns, metas } = makeColumnsAndMetas();
    const index = buildUnlockGuidIndex(columns, metas);
    expect(index.get("item")).toEqual(new Set(["item-1", "item-2"]));
    expect(index.get("block")).toEqual(new Set(["block-1"]));
    expect(index.get("train")).toEqual(new Set(["train-1"]));
  });

  it("omits kinds whose column is missing", () => {
    const { columns, metas } = makeColumnsAndMetas();
    const withoutBlocks = columns.filter((c) => c.title !== "blocks");
    const index = buildUnlockGuidIndex(withoutBlocks, metas);
    expect(index.has("block")).toBe(false);
    expect(index.has("item")).toBe(true);
  });
});

describe("resolveUnlockRef", () => {
  it("returns blockGuid directly for block nodes (no itemGuid indirection)", () => {
    const { columns, metas } = makeColumnsAndMetas();
    const index = buildUnlockGuidIndex(columns, metas);
    expect(resolveUnlockRef(makeNode("block", "block-1"), index)).toEqual({
      kind: "block",
      guid: "block-1",
    });
  });

  it("returns null for dangling masterGuids of every kind", () => {
    const { columns, metas } = makeColumnsAndMetas();
    const index = buildUnlockGuidIndex(columns, metas);
    expect(resolveUnlockRef(makeNode("item", "ghost"), index)).toBeNull();
    expect(resolveUnlockRef(makeNode("block", "ghost"), index)).toBeNull();
    expect(resolveUnlockRef(makeNode("train", "ghost"), index)).toBeNull();
  });

  it("returns null for kinds without an index entry (unloaded column)", () => {
    const { columns, metas } = makeColumnsAndMetas();
    const withoutTrain = columns.filter((c) => c.title !== "train");
    const index = buildUnlockGuidIndex(withoutTrain, metas);
    expect(resolveUnlockRef(makeNode("train", "train-1"), index)).toBeNull();
  });

  it("returns null for non-unlockable node types", () => {
    const { columns, metas } = makeColumnsAndMetas();
    const index = buildUnlockGuidIndex(columns, metas);
    expect(resolveUnlockRef(makeNode("research", "item-1"), index)).toBeNull();
    expect(resolveUnlockRef(makeNode("note", "item-1"), index)).toBeNull();
  });
});
